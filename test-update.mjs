import fs from 'fs';

async function testUpdate() {
  const envFile = fs.readFileSync('.env.local', 'utf-8');
  const match = envFile.match(/RISE_API_TOKEN=(.*)/);
  const realToken = match ? match[1].trim() : '';
  
  const url = `https://brain.havia.id/index.php/api/users/12`; // Adjust ID if needed
  
  const body = {
    address: 'alamat testing 123',
  };

  const formData = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    formData.append(key, value);
  });

  console.log('Sending PUT with x-www-form-urlencoded...');
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'authtoken': realToken,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: formData.toString(),
  });
  
  console.log('PUT Response:', await response.text());

  console.log('Fetching user to verify...');
  const getRes = await fetch(url, {
    headers: { 'authtoken': realToken }
  });
  const user = await getRes.json();
  console.log('Address is now:', user.data ? user.data.address : user.address);
}

testUpdate();
