import { normalizeSession, normalizeSessions } from './sessions.normalizer.js';
import type { SessionRaw } from './sessions.types.js';

describe('SessionsNormalizer', () => {
  const mockRaw: SessionRaw = {
    id: 123,
    title: 'Sessão Ordinária',
    type: 'Ordinária',
    openingDateStr: '15/03/2025',
    legislature: '2023-2027',
    legislativeSession: '1ª Sessão',
    urlPath: '/sessao/123/ver',
  };

  it('should normalize session correctly', () => {
    const session = normalizeSession(mockRaw);

    expect(session.id).toBe(123);
    expect(session.title).toBe('Sessão Ordinária');
    expect(session.type).toBe('Ordinária');
    expect(session.openingDate).toBeInstanceOf(Date);
    expect(session.legislature).toBe('2023-2027');
    expect(session.legislativeSession).toBe('1ª Sessão');
    expect(session.url).toContain('/sessao/123/ver');
    expect(session.detalhesColetados).toBe('NAO_COLETADO');
  });

  it('should build full URL from path', () => {
    const session = normalizeSession(mockRaw);
    expect(session.url).toBe('https://sapl.campinagrande.pb.leg.br/sessao/123/ver');
  });

  it('should handle full URLs', () => {
    const rawWithFullUrl = {
      ...mockRaw,
      urlPath: 'https://example.com/sessao/123',
    };
    const session = normalizeSession(rawWithFullUrl);
    expect(session.url).toBe('https://example.com/sessao/123');
  });

  it('should throw on missing required fields', () => {
    const invalidRaw = {
      ...mockRaw,
      title: '',
    };

    expect(() => normalizeSession(invalidRaw)).toThrow();
  });

  it('should normalize multiple sessions', () => {
    const rawSessions: SessionRaw[] = [mockRaw, { ...mockRaw, id: 124 }];
    const sessions = normalizeSessions(rawSessions);

    expect(sessions).toHaveLength(2);
    expect(sessions[0].id).toBe(123);
    expect(sessions[1].id).toBe(124);
  });

  it('should skip invalid sessions', () => {
    const rawSessions: SessionRaw[] = [
      mockRaw,
      { ...mockRaw, id: 124, title: '' }, // Invalid
      { ...mockRaw, id: 125 },
    ];

    const sessions = normalizeSessions(rawSessions);
    expect(sessions).toHaveLength(2); // Should skip invalid one
  });
});


