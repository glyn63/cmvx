document.getElementById("lichessForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const urlInput = document.getElementById("lichessUrl").value.trim();
  const output = document.getElementById("output");
  const match = urlInput.match(/lichess\.org\/([a-zA-Z0-9]{8})/);

  if (!match) {
    output.textContent = "❌ Invalid Lichess URL. It should look like https://lichess.org/Abc12345";
    return;
  }

  const gameId = match[1];
  const pgnUrl = `https://lichess.org/game/export/${gameId}.pgn`;

  try {
    const response = await fetch(pgnUrl);
    if (!response.ok) throw new Error("Game not found or cannot be fetched.");

    const pgnText = await response.text();

    const chess = new Chess();
    const parsed = chess.load_pgn(pgnText);

    if (!parsed) {
      output.textContent = "❌ Failed to parse PGN.";
    } else {
      output.textContent = `✅ Game loaded!\n\nMoves:\n${chess.history().join(' ')}`;
    }
  } catch (error) {
    output.textContent = `❌ Error: ${error.message}`;
  }
});
