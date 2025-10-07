export interface QueueItem<T> {
  priority: number;
  value: T;
  tieBreaker: number;
}

export class PriorityQueue<T> {
  private heap: QueueItem<T>[] = [];

  enqueue(value: T, priority: number, tieBreaker: number) {
    const item = { value, priority, tieBreaker } satisfies QueueItem<T>;
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): QueueItem<T> | undefined {
    if (this.heap.length === 0) return undefined;
    const root = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return root;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parent]) >= 0) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length;
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }

  private compare(a: QueueItem<T>, b: QueueItem<T>): number {
    if (a.priority === b.priority) {
      return a.tieBreaker - b.tieBreaker;
    }
    return a.priority - b.priority;
  }
}
