import urllib.request, json, urllib.parse

# Login
login_data = urllib.parse.urlencode({'username':'admin@smartbed.ai','password':'admin123'}).encode()
req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data, headers={'Content-Type':'application/x-www-form-urlencoded'})
token = json.load(urllib.request.urlopen(req))['access_token']

# Get queue
req2 = urllib.request.Request('http://localhost:8000/api/patients/queue', headers={'Authorization': f'Bearer {token}'})
queue = json.load(urllib.request.urlopen(req2))

print("ED Queue Patients:")
print(f"Total: {len(queue)}\n")

demo_names = ['Ramesh Kumar', 'Priya Sharma', 'Arjun Patel', 'Meera Nair']
for patient in queue:
    if patient['name'] in demo_names:
        print(f"✓ {patient['name']}")
        print(f"  ID: {patient['id']}")
        print(f"  Age: {patient['age']}")
        print(f"  Triage: {patient['triage_level']}")
        print(f"  Acuity: {patient['acuity_score']}")
        print(f"  Condition: {patient['condition']}")
        print()

# Verify beds don't have these patients assigned
req3 = urllib.request.Request('http://localhost:8000/api/beds', headers={'Authorization': f'Bearer {token}'})
beds = json.load(urllib.request.urlopen(req3))

assigned_to_beds = sum(1 for b in beds if b.get('patient') and b['patient']['name'] in demo_names)
print(f"Demo patients assigned to beds: {assigned_to_beds} (should be 0)")
