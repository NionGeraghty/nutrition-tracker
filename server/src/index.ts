import app from './app';

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});