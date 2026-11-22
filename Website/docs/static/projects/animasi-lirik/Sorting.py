contoh_data= [8, 4, 1, 2, 5]
def bubble_sort(data)
    n = len(data)
    for i in range(n - 1):
        for j in range(n-1-i):
            if data[j] > data[j+1]
            data[j], data[j+1] = data[j+1], data[j]
    return data

print(bubble_sort(contoh_data))