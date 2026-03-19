import json

with open('c:/Users/shark/Downloads/Giftify/wp_json.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Namespaces:")
for ns in data.get('namespaces', []):
    print(f"  - {ns}")

print("\nRoutes matching lost/reset/password:")
for route in data.get('routes', {}):
    if any(keyword in route.lower() for keyword in ['lost', 'reset', 'password']):
        print(f"  - {route}")
