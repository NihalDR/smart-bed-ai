import urllib.request, json, urllib.parse

# Login
login_data = urllib.parse.urlencode({'username':'admin@smartbed.ai','password':'admin123'}).encode()
req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data, headers={'Content-Type':'application/x-www-form-urlencoded'})
token = json.load(urllib.request.urlopen(req))['access_token']

# Get beds
req2 = urllib.request.Request('http://localhost:8000/api/beds', headers={'Authorization': f'Bearer {token}'})
beds = json.load(urllib.request.urlopen(req2))

# Print beds with patient info
print("Sample beds with patient info:")
count = 0
for b in beds:
    if b.get('patient') and count < 3:
        print(json.dumps(b, indent=2))
        count += 1

if count == 0:
    print("First bed:", json.dumps(beds[0], indent=2))
