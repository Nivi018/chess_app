import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

// Only this small single-threaded build is deployed; never copy the full npm bin directory.
const source = new URL('../node_modules/stockfish/', import.meta.url)
const target = new URL('../public/engine/stockfish-19/', import.meta.url)
await mkdir(target, { recursive: true })
for (const name of ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm']) {
  await copyFile(new URL(`bin/${name}`, source), new URL(name, target))
}
await copyFile(new URL('Copying.txt', source), new URL('Copying.txt', target))
const archive = new URL('stockfish.js-v19.0.1-source.tar.gz', target)
try {
  await readFile(archive)
} catch {
  const response = await fetch('https://codeload.github.com/nmrugg/stockfish.js/tar.gz/refs/tags/v19.0.1', { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`Cannot download Stockfish source: ${response.status}`)
  await writeFile(archive, Buffer.from(await response.arrayBuffer()))
}
const hash = createHash('sha256').update(await readFile(archive)).digest('hex')
if (hash !== 'a18aa8a871f5265014b110b3e07804ff3637899d2e189be6ded2b99e2c17a10e') {
  throw new Error('Stockfish source archive checksum mismatch. Remove only the cached archive and retry.')
}
const network = new URL('nn-61e7af4bb97d.nnue', target)
try {
  await readFile(network)
} catch {
  const response = await fetch('https://tests.stockfishchess.org/api/nn/nn-61e7af4bb97d.nnue', { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`Cannot download Stockfish build network: ${response.status}`)
  await writeFile(network, Buffer.from(await response.arrayBuffer()))
}
const networkHash = createHash('sha256').update(await readFile(network)).digest('hex')
if (networkHash !== '61e7af4bb97d51eeeb25d322916f86513b5cd3a827ce189c98c6e31946f99e5b') throw new Error('Stockfish build network checksum mismatch.')
await writeFile(new URL('SOURCE.txt', target), `Unmodified Stockfish.js 19.0.1 lite single-threaded engine. GPL-3.0.\nAuthors: Stockfish contributors; JavaScript/WASM port by Nathan Rugg and contributors.\nSource: https://github.com/nmrugg/stockfish.js/tree/v19.0.1\nLocal source archive: stockfish.js-v19.0.1-source.tar.gz\nArchive SHA256: ${hash}\nBuild network (also available here): nn-61e7af4bb97d.nnue\nNetwork SHA256: ${networkHash}\nBuild instructions: extract archive, copy the adjacent NNUE file into src/, install Emscripten 6.0.9, then run npm run build-single-lite. See README.md and build.js --help in the archive. No engine source modifications.\n`)
console.log('Prepared Stockfish lite worker, WASM, GPL license and matching source archive.')
