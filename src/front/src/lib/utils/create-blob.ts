export const createBlob = (
    chunks: Map<number, Uint8Array<ArrayBufferLike>>,
) => {
    const sortedChunks = Array.from(chunks.keys()).sort((a, b) => a - b);

    const totalSize = sortedChunks.reduce(
        (sum, chunk) => sum + chunks.get(chunk)!.length,
        0,
    );

    const result = new Uint8Array(totalSize);
    let offset = 0;

    for (const sortedChunk of sortedChunks) {
        const chunk = chunks.get(sortedChunk)!;
        result.set(chunk, offset);
        offset += chunk.length;
    }

    return new Blob([result]);
};
