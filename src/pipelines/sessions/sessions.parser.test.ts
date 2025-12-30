import { parseSessions } from './sessions.parser.js';

describe('SessionsParser', () => {
  it('should parse sessions from HTML table', () => {
    const html = `
      <table>
        <tbody>
          <tr>
            <td><a href="/sessao/123/ver">Sessão Ordinária</a></td>
            <td>Ordinária</td>
            <td>15/03/2025</td>
            <td>2023-2027</td>
            <td>1ª Sessão</td>
          </tr>
          <tr>
            <td><a href="/sessao/124/ver">Sessão Extraordinária</a></td>
            <td>Extraordinária</td>
            <td>20/03/2025</td>
            <td>2023-2027</td>
            <td>2ª Sessão</td>
          </tr>
        </tbody>
      </table>
    `;

    const sessions = parseSessions(html);

    expect(sessions).toHaveLength(2);
    expect(sessions[0].id).toBe(123);
    expect(sessions[0].title).toBe('Sessão Ordinária');
    expect(sessions[1].id).toBe(124);
  });

  it('should return empty array for empty HTML', () => {
    const html = '<html><body></body></html>';
    const sessions = parseSessions(html);
    expect(sessions).toHaveLength(0);
  });

  it('should extract session ID from URL', () => {
    const html = `
      <table>
        <tbody>
          <tr>
            <td><a href="/sessao/999/ver">Test</a></td>
            <td>Type</td>
            <td>01/01/2025</td>
            <td>Legislature</td>
            <td>Session</td>
          </tr>
        </tbody>
      </table>
    `;

    const sessions = parseSessions(html);
    expect(sessions[0].id).toBe(999);
  });
});


