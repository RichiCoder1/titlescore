// Adapted from https://github.com/mcollina/split2/

/**
 * A transform stream that splits a stream of NDJson text into a stream of JSON Objects.
 */
export class NdJsonStream extends TransformStream<BufferSource, unknown> {
  private overflow = false;
  private readonly skipOverflow = false;
  private readonly maxLength: number | undefined;
  private last: string | undefined = "";
  private decoder = new TextDecoder("utf-8");

  constructor(
    private readonly matcher: string | RegExp = /\r?\n/,
    private readonly mapper = (chunk: string) => JSON.parse(chunk)
  ) {
    super({
      transform: (chunk: BufferSource, controller) => {
        let list: string[];
        if (this.overflow) {
          // Line buffer is full. Skip to start of next line.
          const buf = this.decoder.decode(chunk);
          list = buf.split(this.matcher);

          if (list.length === 1) return controller.enqueue();

          // Line ending found. Discard trailing fragment of previous line and reset overflow state.
          list.shift();
          this.overflow = false;
        } else {
          this.last += this.decoder.decode(chunk);
          list = this.last!.split(this.matcher);
        }

        this.last = list.pop();

        for (let i = 0; i < list.length; i++) {
          try {
            controller.enqueue(this.mapper(list[i]));
          } catch (error) {
            return controller.error(error);
          }
        }

        this.overflow = (this.last?.length ?? 0) > (this.maxLength ?? Number.MAX_SAFE_INTEGER);
        if (this.overflow && !this.skipOverflow) {
          controller.error(new Error("maximum buffer reached"));
          return;
        }
      },
      flush: (controller) => {
        this.last += this.decoder.decode();
        if (this.last) {
          try {
            controller.enqueue(this.mapper(this.last));
          } catch (error) {
            return controller.error(error);
          }
        }
      },
    });
  }
}
