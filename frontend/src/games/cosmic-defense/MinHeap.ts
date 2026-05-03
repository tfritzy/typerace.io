export class MinHeap<T> {
  private data: T[] = [];
  constructor(private readonly compare: (a: T, b: T) => number) {}

  push(item: T): void {
    this.data.push(item);
    this.siftUp(this.data.length - 1);
  }

  peek(): T | undefined { return this.data[0]; }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  get size(): number { return this.data.length; }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(this.data[i], this.data[parent]) >= 0) break;
      [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const leftChild = 2 * i + 1, rightChild = 2 * i + 2;
      if (leftChild < n && this.compare(this.data[leftChild], this.data[smallest]) < 0) smallest = leftChild;
      if (rightChild < n && this.compare(this.data[rightChild], this.data[smallest]) < 0) smallest = rightChild;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}
