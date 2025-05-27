// Wait for DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lichessForm');
  const urlInput = document.getElementById('lichessUrl');
  const output = document.getElementById('output');
  const errorDiv = document.getElementById('error');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorDiv.textContent = '';
    output.innerHTML = '';

    const lichessUrl = urlInput.value.trim();

    // Validate URL
    if (!lichessUrl.startsWith('https://lichess.org/')) {
      errorDiv.textContent = 'Please enter a valid Lichess game URL.';
      return;
    }

    try {
      // Extract game ID from URL (e.g., https://lichess.org/abcdefg)
      const gameIdMatch = lichessUrl.match(/lichess\.org\/([a-zA-Z0-9]+)/);
      if (!gameIdMatch) {
        errorDiv.textContent = 'Could not extract game ID from URL.';
        return;
      }
      const gameId = gameIdMatch[1];

      // Fetch PGN using Lichess API (no CORS issue here)
      const pgnUrl = `https://lichess.org/game/export/${gameId}.pgn`;
      const response = await fetch(pgnUrl);

      if (!response.ok) {
        errorDiv.textContent = `Failed to fetch PGN: ${response.status} ${response.statusText}`;
        return;
      }

      const pgn = await response.text();

      // Parse PGN and generate move details
      const movesDetails = parsePGNwithDetails(pgn);

      // Render the moves in a table
      output.innerHTML = renderMovesTable(movesDetails);

    } catch (err) {
      errorDiv.textContent = 'Error: ' + err.message;
    }
  });
});

// Parses PGN and returns array of move details
function parsePGNwithDetails(pgn) {
  const chess = new Chess();
  chess.load_pgn(pgn);

  const history = chess.history({ verbose: true });
  const result = [];

  // Create a fresh Chess instance to replay moves for fen
  const chessReplay = new Chess();

  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    chessReplay.move(move);

    result.push({
      turn: Math.floor(i / 2) + 1,
      piece: move.piece,
      color: move.color,
      from: move.from,
      to: move.to,
      san: move.san,
      fen: chessReplay.fen()
    });
  }

  return result;
}

// Render move details in a HTML table
function renderMovesTable(moves) {
  if (!moves.length) return '<p>No moves found.</p>';

  let html = `<table>
    <thead>
      <tr>
        <th>Turn</th>
        <th>Piece</th>
        <th>Color</th>
        <th>From</th>
        <th>To</th>
        <th>SAN</th>
        <th>FEN after move</th>
      </tr>
    </thead>
    <tbody>`;

  moves.forEach(move => {
    html += `<tr>
      <td>${move.turn}</td>
      <td>${move.piece.toUpperCase()}</td>
      <td>${move.color}</td>
      <td>${move.from}</td>
      <td>${move.to}</td>
      <td>${move.san}</td>
      <td><code>${move.fen}</code></td>
    </tr>`;
  });

  html += '</tbody></table>';
  return html;
}
