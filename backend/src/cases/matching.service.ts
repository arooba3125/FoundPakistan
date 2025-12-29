import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case, CaseStatus, CaseType } from './case.entity';
import { CaseMatch, CaseMatchStatus } from './case-match.entity';
import { ContactRequest, ContactRequestStatus } from './contact-request.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Case)
    private casesRepository: Repository<Case>,
    @InjectRepository(CaseMatch)
    private caseMatchRepository: Repository<CaseMatch>,
    @InjectRepository(ContactRequest)
    private contactRequestRepository: Repository<ContactRequest>,
    private emailService: EmailService,
  ) {}

  /**
   * Calculate match score between two cases (0-100)
   * Required: Gender must match, Age within ±3 years
   * Scoring: Name similarity (40), Date proximity (30), Location (30)
   */
  calculateMatchScore(missingCase: Case, foundCase: Case): number {
    // REQUIRED CHECKS - if these fail, return 0
    // Gender must match exactly
    if (missingCase.gender !== foundCase.gender) {
      return 0;
    }

    // Age must be within ±3 years
    if (missingCase.age && foundCase.age) {
      const ageDiff = Math.abs(missingCase.age - foundCase.age);
      if (ageDiff > 3) {
        return 0;
      }
    }

    // If required checks pass, calculate score
    let score = 0;

    // Name Similarity (40 points) - using Levenshtein-like fuzzy matching
    if (missingCase.name && foundCase.name) {
      const nameScore = this.calculateNameSimilarity(
        missingCase.name.toLowerCase(),
        foundCase.name.toLowerCase(),
      );
      score += nameScore * 40;
    }

    // Date Proximity (30 points)
    // For FOUND cases, last_seen_date represents when the person was found
    const dateScore = this.calculateDateProximity(
      missingCase.last_seen_date,
      foundCase.last_seen_date,
    );
    score += dateScore * 30;

    // Location (30 points)
    if (missingCase.city && foundCase.city) {
      const locationScore = this.calculateLocationSimilarity(
        missingCase.city,
        foundCase.city,
      );
      score += locationScore * 30;
    }

    return Math.round(score);
  }

  /**
   * Calculate name similarity using Levenshtein distance (0-1)
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    if (!name1 || !name2) return 0;
    if (name1 === name2) return 1;

    // Simple character-based similarity (can be enhanced with Levenshtein)
    const longer = name1.length > name2.length ? name1 : name2;
    const shorter = name1.length > name2.length ? name2 : name1;

    // If one name contains the other, give high score
    if (longer.includes(shorter)) {
      return 0.9;
    }

    // Calculate character overlap
    const commonChars = this.countCommonCharacters(name1, name2);
    const maxLength = Math.max(name1.length, name2.length);
    
    return commonChars / maxLength;
  }

  /**
   * Count common characters between two strings (simple approach)
   */
  private countCommonCharacters(str1: string, str2: string): number {
    const chars1 = str1.split('').sort();
    const chars2 = str2.split('').sort();
    
    let count = 0;
    let i = 0;
    let j = 0;
    
    while (i < chars1.length && j < chars2.length) {
      if (chars1[i] === chars2[j]) {
        count++;
        i++;
        j++;
      } else if (chars1[i] < chars2[j]) {
        i++;
      } else {
        j++;
      }
    }
    
    return count;
  }

  /**
   * Calculate date proximity score (0-1)
   * Within 60 days = 1.0, 60-90 days = 0.7, >90 days = 0.3
   */
  private calculateDateProximity(date1: Date | null, date2: Date | null): number {
    if (!date1 || !date2) return 0.5; // If dates missing, give neutral score

    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffDays = Math.abs((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 60) return 1.0;
    if (diffDays <= 90) return 0.7;
    return 0.3;
  }

  /**
   * Calculate location similarity score (0-1)
   * Same city = 1.0, Different city = 0.15 (low but not zero)
   */
  private calculateLocationSimilarity(city1: string, city2: string): number {
    if (!city1 || !city2) return 0.15;
    if (city1.toLowerCase().trim() === city2.toLowerCase().trim()) {
      return 1.0;
    }
    return 0.15; // Different city but still possible
  }

  /**
   * Find potential matches for a case
   * Returns cases with match score >= 70
   */
  async findPotentialMatches(caseId: string): Promise<CaseMatch[]> {
    const sourceCase = await this.casesRepository.findOne({
      where: { case_id: caseId },
    });

    if (!sourceCase) {
      throw new Error('Case not found');
    }

    // Only match VERIFIED cases
    if (sourceCase.status !== CaseStatus.VERIFIED) {
      return [];
    }

    // Determine opposite case type
    const oppositeType =
      sourceCase.case_type === CaseType.MISSING
        ? CaseType.FOUND
        : CaseType.MISSING;

    // Find all VERIFIED cases of opposite type
    const candidates = await this.casesRepository.find({
      where: {
        case_type: oppositeType,
        status: CaseStatus.VERIFIED,
      },
      relations: ['reporter'],
    });

    const potentialMatches: CaseMatch[] = [];

    for (const candidate of candidates) {
      // Skip if already matched
      if (candidate.matched_with_case_id) {
        continue;
      }

      // Skip if case is cancelled
      if (candidate.cancelled_at) {
        continue;
      }

      // Skip if source case is cancelled
      if (sourceCase.cancelled_at) {
        continue;
      }

      // Calculate match score
      const matchScore = this.calculateMatchScore(sourceCase, candidate);

      // Only consider matches with score >= 70
      if (matchScore >= 70) {
        // Check if match already exists
        const existingMatch = await this.caseMatchRepository.findOne({
          where: [
            {
              missing_case_id:
                sourceCase.case_type === CaseType.MISSING
                  ? sourceCase.case_id
                  : candidate.case_id,
              found_case_id:
                sourceCase.case_type === CaseType.FOUND
                  ? sourceCase.case_id
                  : candidate.case_id,
              status: CaseMatchStatus.PENDING,
            },
            {
              missing_case_id:
                sourceCase.case_type === CaseType.FOUND
                  ? sourceCase.case_id
                  : candidate.case_id,
              found_case_id:
                sourceCase.case_type === CaseType.MISSING
                  ? sourceCase.case_id
                  : candidate.case_id,
              status: CaseMatchStatus.PENDING,
            },
          ],
        });

        if (!existingMatch) {
          // Create new potential match
          const match = this.caseMatchRepository.create({
            missing_case_id:
              sourceCase.case_type === CaseType.MISSING
                ? sourceCase.case_id
                : candidate.case_id,
            found_case_id:
              sourceCase.case_type === CaseType.FOUND
                ? sourceCase.case_id
                : candidate.case_id,
            match_score: Math.round(matchScore), // Ensure integer
            status: CaseMatchStatus.PENDING,
          });

          const savedMatch = await this.caseMatchRepository.save(match);
          potentialMatches.push(savedMatch);
        }
      }
    }

    return potentialMatches;
  }

  /**
   * Get all pending matches (for admin panel)
   * Excludes matches where either case is cancelled
   */
  async getPendingMatches(): Promise<CaseMatch[]> {
    const matches = await this.caseMatchRepository.find({
      where: { status: CaseMatchStatus.PENDING },
      relations: ['missingCase', 'missingCase.reporter', 'foundCase', 'foundCase.reporter'],
      order: { match_score: 'DESC', createdAt: 'DESC' },
    });
    
    // Filter out matches where either case is cancelled
    return matches.filter(match => {
      return !match.missingCase.cancelled_at && !match.foundCase.cancelled_at;
    });
  }

  /**
   * Get a specific match by ID
   */
  async getMatchById(matchId: string): Promise<CaseMatch> {
    const match = await this.caseMatchRepository.findOne({
      where: { id: matchId },
      relations: ['missingCase', 'missingCase.reporter', 'foundCase', 'foundCase.reporter'],
    });

    if (!match) {
      throw new Error('Match not found');
    }

    return match;
  }

  /**
   * Confirm a match (admin only)
   * Links cases together, marks both as FOUND
   */
  async confirmMatch(matchId: string, adminId: string): Promise<CaseMatch> {
    const match = await this.getMatchById(matchId);

    if (match.status !== CaseMatchStatus.PENDING) {
      throw new Error('Match has already been processed');
    }

    // Load both cases with relations (relations might not be fully loaded)
    const missingCase = await this.casesRepository.findOne({
      where: { case_id: match.missing_case_id },
      relations: ['reporter'],
    });
    const foundCase = await this.casesRepository.findOne({
      where: { case_id: match.found_case_id },
      relations: ['reporter'],
    });

    if (!missingCase || !foundCase) {
      throw new Error('Cases not found');
    }

    // Link cases together
    missingCase.matched_with_case_id = foundCase.case_id;
    foundCase.matched_with_case_id = missingCase.case_id;

    // Mark both as FOUND
    missingCase.status = CaseStatus.FOUND;
    foundCase.status = CaseStatus.FOUND;
    missingCase.verified_by = adminId;
    foundCase.verified_by = adminId;
    missingCase.verified_at = new Date();
    foundCase.verified_at = new Date();

    await this.casesRepository.save([missingCase, foundCase]);

    // Cancel all pending contact requests for both cases (cases are resolved)
    try {
      const [missingPendingRequests, foundPendingRequests] = await Promise.all([
        this.contactRequestRepository.find({
          where: {
            case_id: missingCase.case_id,
            status: ContactRequestStatus.PENDING,
          },
        }),
        this.contactRequestRepository.find({
          where: {
            case_id: foundCase.case_id,
            status: ContactRequestStatus.PENDING,
          },
        }),
      ]);
      
      const allPendingRequests = [...missingPendingRequests, ...foundPendingRequests];
      if (allPendingRequests.length > 0) {
        allPendingRequests.forEach(request => {
          request.status = ContactRequestStatus.REJECTED;
          request.respondedAt = new Date();
        });
        await this.contactRequestRepository.save(allPendingRequests);
      }
    } catch (error) {
      console.error('Failed to cancel pending contact requests:', error);
      // Don't fail the match confirmation if this fails
    }

    // Update match status
    match.status = CaseMatchStatus.CONFIRMED;
    match.confirmed_by = adminId;
    match.confirmed_at = new Date();
    const savedMatch = await this.caseMatchRepository.save(match);

    // Send email notifications to both parties
    try {
      // Email to missing case reporter
      if (missingCase.reporter?.email) {
        await this.emailService.sendMatchConfirmedEmail(
          missingCase.reporter.email,
          missingCase.case_id,
          missingCase.name,
          foundCase.case_id,
          foundCase.name,
          foundCase.reporter?.name || foundCase.contact_name || foundCase.reporter?.email,
          foundCase.contact_phone || '',
          foundCase.contact_email || foundCase.reporter?.email || '',
        );
      }

      // Email to found case reporter
      if (foundCase.reporter?.email) {
        await this.emailService.sendMatchConfirmedEmail(
          foundCase.reporter.email,
          foundCase.case_id,
          foundCase.name,
          missingCase.case_id,
          missingCase.name,
          missingCase.reporter?.name || missingCase.contact_name || missingCase.reporter?.email,
          missingCase.contact_phone || '',
          missingCase.contact_email || missingCase.reporter?.email || '',
        );
      }
    } catch (error) {
      console.error('Failed to send match confirmation emails:', error);
      // Don't fail the match confirmation if emails fail
    }

    return savedMatch;
  }

  /**
   * Reject a match (admin only)
   */
  async rejectMatch(matchId: string, adminId: string): Promise<CaseMatch> {
    const match = await this.getMatchById(matchId);

    if (match.status !== CaseMatchStatus.PENDING) {
      throw new Error('Match has already been processed');
    }

    match.status = CaseMatchStatus.REJECTED;
    const savedMatch = await this.caseMatchRepository.save(match);

    return savedMatch;
  }

  /**
   * Reject all pending matches for a cancelled case
   * Called when a case is cancelled to cleanup matches
   */
  async rejectMatchesForCase(caseId: string): Promise<void> {
    try {
      const pendingMatches = await this.caseMatchRepository.find({
        where: [
          { missing_case_id: caseId, status: CaseMatchStatus.PENDING },
          { found_case_id: caseId, status: CaseMatchStatus.PENDING },
        ],
      });

      if (pendingMatches.length > 0) {
        pendingMatches.forEach(match => {
          match.status = CaseMatchStatus.REJECTED;
        });
        await this.caseMatchRepository.save(pendingMatches);
      }
    } catch (error) {
      console.error('Failed to reject matches for cancelled case:', error);
      // Don't fail the cancellation if match cleanup fails
    }
  }
}

