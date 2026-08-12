#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int arr1[] = {5, 2, 8};
    int arr2[] = {1, 7, 3};
    int n1 = sizeof(arr1) / sizeof(arr1[0]);
    int n2 = sizeof(arr2) / sizeof(arr2[0]);
    int combined[n1 + n2];

    // Copy elements from arr1 to combined
    for (int i = 0; i < n1; i++) {
        combined[i] = arr1[i];
    }

    // Copy elements from arr2 to combined
    for (int i = 0; i < n2; i++) {
        combined[n1 + i] = arr2[i];
    }

    // Sort the combined array
    sort(combined, combined + n1 + n2);

    // Print the sorted array
    cout << "Combined and Sorted Array: ";
    for (int i = 0; i < n1 + n2; i++) {
        cout << combined[i] << " ";
    }

    return 0;
}