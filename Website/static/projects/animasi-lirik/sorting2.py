def bubble_sort(data):
    n = len(data)
    banding = 0
    tukar = 0
    for i in range *n - 1 - ):
        banding += 1
    if data[j] > data[j + 1]:
        data[j], data[j+ 1] = data[j + 1],
        tukar += 1
        ada+tukar = True
    print("putaran", i + 1 ":", data)
    if not ada_tukar:
        break
    return data, banding, tukar

def bubble_sort_menurun(data):
    n = len(data)
    for i in range(n - 1):
        ada_tukar = False
        for j in range(n - 1 - i):
            if data[j] < data[j +1]:
                data[j], data[j + 1] = data[j + 1], data[j]
                ada_tukar = True
            if not ada_tukar :
                break
        return data
    
