document.addEventListener('DOMContentLoaded', () => {
    // Fetch Dashboard Data
    fetch('/api/dashboard')
      .then(response => response.json())
      .then(data => {
        document.getElementById('appointmentsCount').textContent = data.appointmentsCount;
        document.getElementById('pendingRequests').textContent = data.pendingRequests;
        document.getElementById('completedJobs').textContent = data.completedJobs;
        document.getElementById('newMessages').textContent = data.newMessages;
        document.getElementById('alerts').textContent = data.alerts;
      })
      .catch(error => console.error('Error fetching dashboard data:', error));
  
    // Fetch Repair Requests Data
    fetch('/api/repair_requests')
      .then(response => response.json())
      .then(requests => {
        const requestList = document.getElementById('requestList');
        requests.forEach(request => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${request.customer}</td>
            <td>${request.device}</td>
            <td>${request.issue}</td>
            <td>${request.time}</td>
            <td><button>${request.action}</button></td>
          `;
          requestList.appendChild(row);
        });
      })
      .catch(error => console.error('Error fetching repair requests:', error));
  
    // Fetch Services (you can create a similar API for services)
    fetch('/api/services')  // This assumes an API for fetching services exists
      .then(response => response.json())
      .then(services => {
        const serviceList = document.getElementById('serviceList');
        services.forEach(service => {
          const li = document.createElement('li');
          li.textContent = service.name;  // Adjust according to actual data structure
          serviceList.appendChild(li);
        });
      })
      .catch(error => console.error('Error fetching services:', error));
  
    // Button Functionalities (example of calling an API for adding a service)
    document.querySelector("button[onclick='addService()']").addEventListener('click', () => {
      const serviceName = prompt("Enter new service name:");
      if (serviceName) {
        fetch('/api/add_service', {  // Assuming you have this API route in Flask
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: serviceName })
        })
          .then(response => response.json())
          .then(data => {
            // Add the new service to the UI dynamically
            const serviceList = document.getElementById('serviceList');
            const li = document.createElement('li');
            li.textContent = serviceName;
            serviceList.appendChild(li);
          })
          .catch(error => console.error('Error adding service:', error));
      }
    });
  
    // Handle Profile Editing (this can be an API call to update the profile)
    document.querySelector("button[onclick='editProfile()']").addEventListener('click', () => {
      const newProfileInfo = prompt("Enter new shop info:");
      if (newProfileInfo) {
        fetch('/api/edit_profile', {  // Assuming you have a Flask route for editing profile
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newInfo: newProfileInfo })
        })
          .then(response => response.json())
          .then(data => {
            alert(`Profile updated: ${newProfileInfo}`);
          })
          .catch(error => console.error('Error editing profile:', error));
      }
    });
  
    // Other functionalities for change password, logout, etc., can be implemented similarly
  });
  