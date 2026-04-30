package com.github.isaiahnoelpulidosalazar.androiddependency;

import java.util.*;
import java.util.stream.IntStream;

public class Sort {

    public static int[] bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }

    public static int[] cocktailShakerSort(int[] arr) {
        boolean swapped = true;
        int start = 0;
        int end = arr.length - 1;
        while (swapped) {
            swapped = false;
            for (int i = start; i < end; ++i) {
                if (arr[i] > arr[i + 1]) {
                    int temp = arr[i];
                    arr[i] = arr[i + 1];
                    arr[i + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
            end = end - 1;
            for (int i = end - 1; i >= start; i--) {
                if (arr[i] > arr[i + 1]) {
                    int temp = arr[i];
                    arr[i] = arr[i + 1];
                    arr[i + 1] = temp;
                    swapped = true;
                }
            }
            start = start + 1;
        }
        return arr;
    }

    public static int[] oddEvenSort(int[] arr) {
        boolean isSorted = false;
        while (!isSorted) {
            isSorted = true;
            for (int i = 1; i < arr.length - 1; i += 2) {
                if (arr[i] > arr[i + 1]) {
                    int temp = arr[i];
                    arr[i] = arr[i + 1];
                    arr[i + 1] = temp;
                    isSorted = false;
                }
            }
            for (int i = 0; i < arr.length - 1; i += 2) {
                if (arr[i] > arr[i + 1]) {
                    int temp = arr[i];
                    arr[i] = arr[i + 1];
                    arr[i + 1] = temp;
                    isSorted = false;
                }
            }
        }
        return arr;
    }

    public static int[] selectionSort(int[] arr) {
        for (int i = 0; i < arr.length; i++) {
            int minIdx = i;
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[minIdx] > arr[j]) {
                    minIdx = j;
                }
            }
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
        return arr;
    }

    public static int[] insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && key < arr[j]) {
                arr[j + 1] = arr[j];
                j -= 1;
            }
            arr[j + 1] = key;
        }
        return arr;
    }

    public static int[] shellsort(int[] arr) {
        int n = arr.length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int temp = arr[i];
                int j = i;
                while (j >= gap && arr[j - gap] > temp) {
                    arr[j] = arr[j - gap];
                    j -= gap;
                }
                arr[j] = temp;
            }
        }
        return arr;
    }

    public static int[] quicksort(int[] arr) {
        if (arr.length <= 1) return arr;
        int pivot = arr[arr.length / 2];
        int[] left = Arrays.stream(arr).filter(x -> x < pivot).toArray();
        int[] middle = Arrays.stream(arr).filter(x -> x == pivot).toArray();
        int[] right = Arrays.stream(arr).filter(x -> x > pivot).toArray();

        int[] result = new int[arr.length];
        System.arraycopy(left, 0, result, 0, left.length);
        System.arraycopy(middle, 0, result, left.length, middle.length);
        System.arraycopy(right, 0, result, left.length + middle.length, right.length);
        return result;
    }

    public static int[] mergeSort(int[] arr) {
        if (arr.length <= 1) return arr;
        int mid = arr.length / 2;
        int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));
        int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));

        int[] res = new int[arr.length];
        int i = 0, j = 0, k = 0;
        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) {
                res[k++] = left[i++];
            } else {
                res[k++] = right[j++];
            }
        }
        while (i < left.length) res[k++] = left[i++];
        while (j < right.length) res[k++] = right[j++];
        return res;
    }

    public static int[] heapsort(int[] arr) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : arr) pq.add(x);
        for (int i = 0; i < arr.length; i++) {
            arr[i] = pq.poll();
        }
        return arr;
    }

    public static int[] introsort(int[] arr) {
        int maxDepth = 2 * (int) Math.floor(Math.log(arr.length) / Math.log(2));
        return introSortHelper(arr, maxDepth);
    }

    private static int[] introSortHelper(int[] arr, int depth) {
        if (arr.length <= 1) return arr;
        if (depth == 0) return heapsort(arr);

        int pivot = arr[0];
        int[] left = Arrays.stream(arr).skip(1).filter(x -> x <= pivot).toArray();
        int[] right = Arrays.stream(arr).skip(1).filter(x -> x > pivot).toArray();

        int[] sortedLeft = introSortHelper(left, depth - 1);
        int[] sortedRight = introSortHelper(right, depth - 1);

        int[] res = new int[arr.length];
        System.arraycopy(sortedLeft, 0, res, 0, sortedLeft.length);
        res[sortedLeft.length] = pivot;
        System.arraycopy(sortedRight, 0, res, sortedLeft.length + 1, sortedRight.length);
        return res;
    }

    public static int[] timsort(int[] arr) {
        int[] res = arr.clone();
        Arrays.sort(res);
        return res;
    }

    public static int[] countingSort(int[] arr) {
        if (arr == null || arr.length == 0) return arr;
        int maxVal = Arrays.stream(arr).max().getAsInt();
        int[] counts = new int[maxVal + 1];
        for (int x : arr) counts[x]++;

        int[] res = new int[arr.length];
        int idx = 0;
        for (int i = 0; i < counts.length; i++) {
            for (int j = 0; j < counts[i]; j++) {
                res[idx++] = i;
            }
        }
        return res;
    }

    public static double[] bucketSortUniform(double[] arr) {
        List<List<Double>> buckets = new ArrayList<>();
        for (int i = 0; i < arr.length; i++) {
            buckets.add(new ArrayList<>());
        }
        for (double x : arr) {
            int index = (int) (x * arr.length);
            if (index >= arr.length) index = arr.length - 1; 
            buckets.get(index).add(x);
        }
        int idx = 0;
        for (List<Double> b : buckets) {
            Collections.sort(b);
            for (double x : b) {
                arr[idx++] = x;
            }
        }
        return arr;
    }

    public static int[] pigeonholeSort(int[] arr) {
        if (arr.length == 0) return arr;
        int minVal = Arrays.stream(arr).min().getAsInt();
        int maxVal = Arrays.stream(arr).max().getAsInt();
        int size = maxVal - minVal + 1;
        int[] holes = new int[size];

        for (int x : arr) holes[x - minVal]++;

        int[] res = new int[arr.length];
        int idx = 0;
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < holes[i]; j++) {
                res[idx++] = i + minVal;
            }
        }
        return res;
    }

    static class Node {
        int v;
        Node l, r;
        Node(int v) { this.v = v; }
    }

    public static int[] treeSort(int[] arr) {
        if (arr.length == 0) return arr;
        Node root = null;
        for (int x : arr) {
            root = insert(root, x);
        }
        List<Integer> res = new ArrayList<>();
        traverse(root, res);
        return res.stream().mapToInt(i -> i).toArray();
    }

    private static Node insert(Node root, int val) {
        if (root == null) return new Node(val);
        if (val < root.v) root.l = insert(root.l, val);
        else root.r = insert(root.r, val);
        return root;
    }

    private static void traverse(Node root, List<Integer> res) {
        if (root != null) {
            traverse(root.l, res);
            res.add(root.v);
            traverse(root.r, res);
        }
    }

    public static int[] patienceSorting(int[] arr) {
        List<List<Integer>> piles = new ArrayList<>();
        for (int x : arr) {
            int left = 0, right = piles.size();
            while (left < right) {
                int mid = left + (right - left) / 2;
                if (piles.get(mid).get(piles.get(mid).size() - 1) >= x) right = mid;
                else left = mid + 1;
            }
            if (left < piles.size()) {
                piles.get(left).add(x);
            } else {
                List<Integer> newPile = new ArrayList<>();
                newPile.add(x);
                piles.add(newPile);
            }
        }

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        for (int i = 0; i < piles.size(); i++) {
            pq.add(new int[]{piles.get(i).get(piles.get(i).size() - 1), i, piles.get(i).size() - 1});
        }

        int[] res = new int[arr.length];
        int idx = 0;
        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            res[idx++] = curr[0];
            int pileIdx = curr[1];
            int itemIdx = curr[2] - 1;
            if (itemIdx >= 0) {
                pq.add(new int[]{piles.get(pileIdx).get(itemIdx), pileIdx, itemIdx});
            }
        }
        return res;
    }

    public static int[] bogoSort(int[] arr) {
        Random rand = new Random();
        while (!isSorted(arr)) {
            for (int i = arr.length - 1; i > 0; i--) {
                int index = rand.nextInt(i + 1);
                int a = arr[index];
                arr[index] = arr[i];
                arr[i] = a;
            }
        }
        return arr;
    }

    private static boolean isSorted(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            if (arr[i] > arr[i + 1]) return false;
        }
        return true;
    }

    public static int[] beadSort(int[] arr) {
        for (int x : arr) {
            if (x < 0) throw new IllegalArgumentException("Bead sort for positive integers only");
        }
        if (arr.length == 0) return arr;
        int maxVal = Arrays.stream(arr).max().getAsInt();
        int[][] beads = new int[arr.length][maxVal];

        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr[i]; j++) {
                beads[i][j] = 1;
            }
        }

        for (int j = 0; j < maxVal; j++) {
            int sumBeads = 0;
            for (int i = 0; i < arr.length; i++) {
                sumBeads += beads[i][j];
            }
            for (int i = 0; i < arr.length; i++) {
                beads[i][j] = (i >= arr.length - sumBeads) ? 1 : 0;
            }
        }

        int[] res = new int[arr.length];
        for (int i = 0; i < arr.length; i++) {
            int rowSum = 0;
            for (int j = 0; j < maxVal; j++) rowSum += beads[i][j];
            res[i] = rowSum;
        }
        return res;
    }
}