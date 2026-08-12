# Selection Sort

A collection of C++ programs implementing **Selection Sort** and related array operations, developed as part of the Software Engineering Lab.

---

## 📁 Files

### [`program.cpp`](program.cpp)
Core implementation of the **Selection Sort** algorithm.

- Takes array size and elements as input from the user.
- Sorts the array in ascending order using the Selection Sort technique.
- Prints the sorted array.

**Time Complexity:**
| Case | Complexity |
|------|------------|
| Best | O(n²) |
| Average | O(n²) |
| Worst | O(n²) |

**Space Complexity:** O(1) — in-place sorting.

---

### [`combined_sorted_array.cpp`](combined_sorted_array.cpp)
Demonstrates **combining two arrays and sorting** the result.

- Merges two predefined integer arrays into a single combined array.
- Sorts the combined array using the standard `sort()` function from `<algorithm>`.
- Prints the final sorted result.

---

## 🔍 How Selection Sort Works

Selection Sort works by repeatedly finding the **minimum element** from the unsorted portion of the array and placing it at the beginning.

```
For each position i from 0 to n-2:
  1. Find the index of the minimum element in arr[i..n-1]
  2. Swap arr[i] with arr[min_index]
```

**Example:**
```
Input:  [64, 25, 12, 22, 11]
Step 1: [11, 25, 12, 22, 64]  → min=11 swapped with 64
Step 2: [11, 12, 25, 22, 64]  → min=12 swapped with 25
Step 3: [11, 12, 22, 25, 64]  → min=22 swapped with 25
Step 4: [11, 12, 22, 25, 64]  → already in place
Output: [11, 12, 22, 25, 64]
```

---

## ▶️ How to Compile & Run

Make sure you have a C++ compiler (e.g., `g++`) installed.

### Selection Sort
```bash
g++ -o program program.cpp
./program
```
**Sample Input:**
```
5
64 25 12 22 11
```
**Sample Output:**
```
11 12 22 25 64
```

---

### Combined Sorted Array
```bash
g++ -o combined combined_sorted_array.cpp
./combined
```
**Sample Output:**
```
Combined and Sorted Array: 1 2 3 5 7 8
```

---

## 🛠️ Requirements

- C++11 or later
- GCC / G++ compiler

---

## 👤 Author

**Yaramala Ganesh Reddy**  
Software Engineering Lab — Selection Sort Assignment