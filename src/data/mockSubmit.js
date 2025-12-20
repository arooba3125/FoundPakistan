export async function mockSubmitCase(payload) {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 600));
  // For now just return a mock case_id
  return { ok: true, case_id: `mock-${Math.random().toString(36).slice(2, 8)}` };
}
