using System;
using System.Collections.Generic;
using System.Linq;

namespace nugetpackage;

public class SortAlgorithms
{
    public static int[] BubbleSort(int[] arr)
    {
        int n = arr.Length;
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n - i - 1; j++)
            {
                if (arr[j] > arr[j + 1])
                {
                    (arr[j + 1], arr[j]) = (arr[j], arr[j + 1]);
                }
            }
        }
        return arr;
    }

    public static int[] CocktailShakerSort(int[] arr)
    {
        int n = arr.Length;
        bool swapped = true;
        int start = 0, end = n - 1;

        while (swapped)
        {
            swapped = false;
            for (int i = start; i < end; i++)
            {
                if (arr[i] > arr[i + 1])
                {
                    (arr[i + 1], arr[i]) = (arr[i], arr[i + 1]);
                    swapped = true;
                }
            }
            if (!swapped) break;
            end--;

            for (int i = end - 1; i >= start; i--)
            {
                if (arr[i] > arr[i + 1])
                {
                    (arr[i + 1], arr[i]) = (arr[i], arr[i + 1]);
                    swapped = true;
                }
            }
            start++;
        }
        return arr;
    }

    public static int[] OddEvenSort(int[] arr)
    {
        int n = arr.Length;
        bool isSorted = false;
        while (!isSorted)
        {
            isSorted = true;
            for (int i = 1; i < n - 1; i += 2)
            {
                if (arr[i] > arr[i + 1])
                {
                    (arr[i + 1], arr[i]) = (arr[i], arr[i + 1]);
                    isSorted = false;
                }
            }
            for (int i = 0; i < n - 1; i += 2)
            {
                if (arr[i] > arr[i + 1])
                {
                    (arr[i + 1], arr[i]) = (arr[i], arr[i + 1]);
                    isSorted = false;
                }
            }
        }
        return arr;
    }

    public static int[] SelectionSort(int[] arr)
    {
        for (int i = 0; i < arr.Length; i++)
        {
            int minIdx = i;
            for (int j = i + 1; j < arr.Length; j++)
            {
                if (arr[minIdx] > arr[j]) minIdx = j;
            }
            (arr[minIdx], arr[i]) = (arr[i], arr[minIdx]);
        }
        return arr;
    }

    public static int[] InsertionSort(int[] arr)
    {
        for (int i = 1; i < arr.Length; i++)
        {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && key < arr[j])
            {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
        return arr;
    }

    public static int[] ShellSort(int[] arr)
    {
        int n = arr.Length;
        int gap = n / 2;
        while (gap > 0)
        {
            for (int i = gap; i < n; i++)
            {
                int temp = arr[i];
                int j = i;
                while (j >= gap && arr[j - gap] > temp)
                {
                    arr[j] = arr[j - gap];
                    j -= gap;
                }
                arr[j] = temp;
            }
            gap /= 2;
        }
        return arr;
    }

    public static int[] QuickSort(int[] arr)
    {
        if (arr.Length <= 1) return arr;
        int pivot = arr[arr.Length / 2];
        var left = arr.Where(x => x < pivot).ToArray();
        var middle = arr.Where(x => x == pivot).ToArray();
        var right = arr.Where(x => x > pivot).ToArray();

        return QuickSort(left).Concat(middle).Concat(QuickSort(right)).ToArray();
    }

    public static int[] MergeSort(int[] arr)
    {
        if (arr.Length <= 1) return arr;
        int mid = arr.Length / 2;
        
        var left = MergeSort(arr.Take(mid).ToArray());
        var right = MergeSort(arr.Skip(mid).ToArray());

        var res = new List<int>();
        int i = 0, j = 0;

        while (i < left.Length && j < right.Length)
        {
            if (left[i] < right[j]) res.Add(left[i++]);
            else res.Add(right[j++]);
        }
        
        res.AddRange(left.Skip(i));
        res.AddRange(right.Skip(j));
        
        return res.ToArray();
    }

    public static int[] HeapSort(int[] arr)
    {
        var pq = new PriorityQueue<int, int>();
        foreach (var item in arr) pq.Enqueue(item, item);

        int[] res = new int[arr.Length];
        for (int i = 0; i < arr.Length; i++) res[i] = pq.Dequeue();
        
        return res;
    }

    public static int[] IntroSort(int[] arr)
    {
        int maxDepth = 2 * (int)Math.Floor(Math.Log(arr.Length, 2));

        int[] SortHelper(int[] subArr, int depth)
        {
            if (subArr.Length <= 1) return subArr;
            if (depth == 0) return HeapSort(subArr);

            int pivot = subArr[0];
            var subArrSkip = subArr.Skip(1).ToArray();
            var left = subArrSkip.Where(x => x <= pivot).ToArray();
            var right = subArrSkip.Where(x => x > pivot).ToArray();

            return SortHelper(left, depth - 1)
                   .Concat(new[] { pivot })
                   .Concat(SortHelper(right, depth - 1))
                   .ToArray();
        }

        return SortHelper(arr, maxDepth);
    }

    public static int[] TimSort(int[] arr)
    {
        int[] res = (int[])arr.Clone();
        Array.Sort(res);
        return res;
    }

    public static int[] CountingSort(int[] arr)
    {
        if (arr == null || arr.Length == 0) return arr;
        int maxVal = arr.Max();
        int[] counts = new int[maxVal + 1];
        foreach (var x in arr) counts[x]++;

        var res = new List<int>();
        for (int i = 0; i < counts.Length; i++)
        {
            res.AddRange(Enumerable.Repeat(i, counts[i]));
        }
        return res.ToArray();
    }

    public static double[] BucketSortUniform(double[] arr)
    {
        var buckets = new List<double>[arr.Length];
        for (int i = 0; i < arr.Length; i++) buckets[i] = new List<double>();

        foreach (var x in arr)
        {
            int index = (int)(x * arr.Length);
            if (index >= arr.Length) index = arr.Length - 1;
            buckets[index].Add(x);
        }

        var res = new List<double>();
        foreach (var b in buckets)
        {
            b.Sort();
            res.AddRange(b);
        }
        return res.ToArray();
    }

    public static int[] PigeonholeSort(int[] arr)
    {
        if (arr.Length == 0) return arr;
        int minVal = arr.Min();
        int maxVal = arr.Max();
        int size = maxVal - minVal + 1;
        int[] holes = new int[size];

        foreach (var x in arr) holes[x - minVal]++;

        var res = new List<int>();
        for (int i = 0; i < size; i++)
        {
            res.AddRange(Enumerable.Repeat(i + minVal, holes[i]));
        }
        return res.ToArray();
    }

    public class Node
    {
        public int v;
        public Node l, r;
        public Node(int v) { this.v = v; }
    }

    public static int[] TreeSort(int[] arr)
    {
        if (arr.Length == 0) return new int[0];

        Node Insert(Node root, int val)
        {
            if (root == null) return new Node(val);
            if (val < root.v) root.l = Insert(root.l, val);
            else root.r = Insert(root.r, val);
            return root;
        }

        void Traverse(Node root, List<int> resList)
        {
            if (root != null)
            {
                Traverse(root.l, resList);
                resList.Add(root.v);
                Traverse(root.r, resList);
            }
        }

        Node mainRoot = null;
        foreach (var x in arr) mainRoot = Insert(mainRoot, x);

        var res = new List<int>();
        Traverse(mainRoot, res);
        return res.ToArray();
    }

    public static int[] PatienceSorting(int[] arr)
    {
        var piles = new List<List<int>>();

        foreach (var x in arr)
        {
            int left = 0, right = piles.Count;
            while (left < right)
            {
                int mid = left + (right - left) / 2;
                if (piles[mid].Last() >= x) right = mid;
                else left = mid + 1;
            }

            if (left < piles.Count) piles[left].Add(x);
            else piles.Add(new List<int> { x });
        }

        var pq = new PriorityQueue<(int pileIdx, int itemIdx), int>();
        for (int i = 0; i < piles.Count; i++)
        {
            int val = piles[i].Last();
            pq.Enqueue((i, piles[i].Count - 1), val);
        }

        var res = new int[arr.Length];
        int idx = 0;

        while (pq.Count > 0)
        {
            pq.TryDequeue(out var curr, out int val);
            res[idx++] = val;

            int nextItemIdx = curr.itemIdx - 1;
            if (nextItemIdx >= 0)
            {
                int nextVal = piles[curr.pileIdx][nextItemIdx];
                pq.Enqueue((curr.pileIdx, nextItemIdx), nextVal);
            }
        }

        return res;
    }

    public static int[] BogoSort(int[] arr)
    {
        var rnd = new Random();
        while (!arr.Zip(arr.Skip(1), (a, b) => a <= b).All(x => x))
        {
            for (int i = arr.Length - 1; i > 0; i--)
            {
                int j = rnd.Next(i + 1);
                (arr[i], arr[j]) = (arr[j], arr[i]);
            }
        }
        return arr;
    }

    public static int[] BeadSort(int[] arr)
    {
        if (arr.Any(x => x < 0)) throw new ArgumentException("Bead sort for positive integers only");
        if (arr.Length == 0) return arr;

        int maxVal = arr.Max();
        int[,] beads = new int[arr.Length, maxVal];

        for (int i = 0; i < arr.Length; i++)
        {
            for (int j = 0; j < arr[i]; j++) beads[i, j] = 1;
        }

        for (int j = 0; j < maxVal; j++)
        {
            int sumBeads = 0;
            for (int i = 0; i < arr.Length; i++) sumBeads += beads[i, j];
            
            for (int i = 0; i < arr.Length; i++)
            {
                beads[i, j] = (i >= arr.Length - sumBeads) ? 1 : 0;
            }
        }

        int[] res = new int[arr.Length];
        for (int i = 0; i < arr.Length; i++)
        {
            int rowSum = 0;
            for (int j = 0; j < maxVal; j++) rowSum += beads[i, j];
            res[i] = rowSum;
        }

        return res;
    }
}