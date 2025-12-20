export const mockCases = [
  {
    case_id: "case-001",
    case_type: "missing",
    status: "open",
    priority: "high",
    report_by: "user-001",
    created_at: "2025-12-01",
    updated_at: "2025-12-02",
    name: "Ayesha Khan",
    name_ur: "عائشہ خان",
    age: 12,
    gender: "female",
    city: "Lahore",
    area: "Gulberg",
    badge_tags: ["urgent", "child"],
    last_seen_location: "Liberty Market, Lahore",
    last_seen_date: "2025-11-28",
    description:
      "Wearing a yellow hoodie and jeans. Carries a small blue backpack with cartoon stickers.",
    description_ur:
      "پیلی ہیڈی اور جینز پہن رکھی تھی۔ نیلا بیگ تھا جس پر کارٹون اسٹیکرز لگے تھے۔",
    media: [
      {
        media_id: "m1",
        media_type: "image",
        file_url:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
        thumbnail_url:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=50",
        is_primary: true,
        source: "user",
      },
      {
        media_id: "m1-2",
        media_type: "image",
        file_url:
          "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
        thumbnail_url:
          "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=50",
        is_primary: false,
        source: "ai_enhanced",
      },
    ],
  },
  {
    case_id: "case-002",
    case_type: "found",
    status: "open",
    priority: "medium",
    report_by: "user-002",
    created_at: "2025-11-25",
    updated_at: "2025-11-26",
    name: "Unidentified Elder",
    name_ur: "نامعلوم بزرگ",
    age_range: "60-70",
    gender: "male",
    city: "Karachi",
    area: "Saddar",
    badge_tags: ["elderly"],
    found_location: "Saddar Empress Market, Karachi",
    found_date: "2025-11-24",
    description:
      "Found near Empress Market, slight memory loss, wearing light grey kurta and white cap.",
    description_ur:
      "ایمپریس مارکیٹ کے قریب ملے، ہلکی یادداشت میں کمی، سرمئی کرتا اور سفید ٹوپی پہن رکھی تھی۔",
    media: [
      {
        media_id: "m2",
        media_type: "image",
        file_url:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80",
        thumbnail_url:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=350&q=50",
        is_primary: true,
        source: "ngo",
      },
    ],
  },
  {
    case_id: "case-003",
    case_type: "missing",
    status: "resolved",
    priority: "low",
    report_by: "user-003",
    created_at: "2025-10-10",
    updated_at: "2025-10-20",
    name: "Bilal Ahmed",
    name_ur: "بلال احمد",
    age: 25,
    gender: "male",
    city: "Islamabad",
    area: "F-10",
    badge_tags: ["adult"],
    last_seen_location: "F-10 Markaz, Islamabad",
    last_seen_date: "2025-10-08",
    description:
      "Missing after leaving work. Last seen in a navy jacket and black trousers.",
    description_ur:
      "دفتر سے نکلنے کے بعد لاپتہ۔ نیوی جیکٹ اور سیاہ پینٹ پہنے ہوئے تھے۔",
    media: [
      {
        media_id: "m3",
        media_type: "image",
        file_url:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80",
        thumbnail_url:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=350&q=50",
        is_primary: true,
        source: "user",
      },
    ],
  },
  {
    case_id: "case-004",
    case_type: "found",
    status: "open",
    priority: "high",
    report_by: "user-004",
    created_at: "2025-11-30",
    updated_at: "2025-12-01",
    name: "Unidentified Child",
    name_ur: "نامعلوم بچہ",
    age_range: "6-8",
    gender: "female",
    city: "Rawalpindi",
    area: "Saddar",
    badge_tags: ["urgent", "child"],
    found_location: "Rawalpindi Saddar station",
    found_date: "2025-11-29",
    description:
      "Found near station, wearing pink sweater, holding a stuffed toy.",
    description_ur:
      "اسٹیشن کے قریب ملی، گلابی سوئٹر پہنے ہوئے، ہاتھ میں ایک کھلونا تھا۔",
    media: [
      {
        media_id: "m4",
        media_type: "image",
        file_url:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80",
        thumbnail_url:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=350&q=50",
        is_primary: true,
        source: "police",
      },
    ],
  },
];
