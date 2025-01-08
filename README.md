# Fitness Tracker

A comprehensive Progressive Web Application (PWA) for tracking your fitness journey. This application helps you log workouts, meals, and water intake while setting and monitoring customizable fitness goals. With offline support and local storage, your fitness data is always accessible.

## Features

- **Dashboard Overview**: Real-time tracking of your fitness progress
- **Workout Tracking**:
  - Weightlifting sessions with exercise details
  - Cardio workout logging
  - Standardized workout names for consistency
- **Meal Planning**: Log and track daily meals and water intake
- **Goal Setting**: Create and monitor custom fitness goals
- **Progress Monitoring**: Track achievements and view progress over time
- **Unit Toggles**: Switch between metric (kg) and imperial (lbs) units
- **Offline Support**: Full functionality even without internet connection
- **Keyboard Shortcuts**: Quick navigation using Alt + 1-5
- **Local Storage**: Secure data persistence in your browser
- **Real-time Data Conversion**: Automatic unit conversions
- **Input Validation**: Ensures data accuracy and security

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- One of the following web servers:
  - Nginx (recommended for production)
  - Apache2 (recommended for production)
  - Python 3 (for development)
  - Node.js (for development)

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/pure/Fitness-Tracker.git
   ```

2. Choose one of the following methods to host the application:

   ### Using Nginx (Recommended for Production):
   1. Install Nginx:
      ```bash
      # Ubuntu/Debian
      sudo apt update
      sudo apt install nginx

      # CentOS/RHEL
      sudo yum install epel-release
      sudo yum install nginx
      ```

   2. Create a server configuration:
      ```bash
      sudo nano /etc/nginx/sites-available/fitness-tracker
      ```

   3. Add the following configuration:
      ```nginx
      server {
          listen 80;
          server_name your-domain.com;  # Replace with your domain or localhost

          root /var/www/fitness-tracker;
          index index.html;

          location / {
              try_files $file $uri $uri/ /index.html;
          }

          # Enable gzip compression
          gzip on;
          gzip_types text/plain text/css application/javascript application/json;

          # Cache static files
          location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
              expires max;
              add_header Cache-Control "public, no-transform";
          }
      }
      ```

   4. Create a symbolic link and copy files:
      ```bash
      sudo ln -s /etc/nginx/sites-available/fitness-tracker /etc/nginx/sites-enabled/
      sudo mkdir -p /var/www/fitness-tracker
      sudo cp -r * /var/www/fitness-tracker/
      sudo nginx -t  # Test configuration
      sudo systemctl restart nginx
      ```

   ### Using Apache2:
   1. Install Apache2:
      ```bash
      # Ubuntu/Debian
      sudo apt update
      sudo apt install apache2

      # CentOS/RHEL
      sudo yum install httpd
      ```

   2. Create a virtual host configuration:
      ```bash
      sudo nano /etc/apache2/sites-available/fitness-tracker.conf
      ```

   3. Add the following configuration:
      ```apache
      <VirtualHost *:80>
          ServerName your-domain.com  # Replace with your domain or localhost
          DocumentRoot /var/www/fitness-tracker

          <Directory /var/www/fitness-tracker>
              Options Indexes FollowSymLinks
              AllowOverride All
              Require all granted
          </Directory>

          # Enable gzip compression
          AddOutputFilterByType DEFLATE text/plain text/css application/javascript application/json

          # Cache static files
          <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico)$">
              Header set Cache-Control "max-age=31536000, public"
          </FilesMatch>
      </VirtualHost>
      ```

   4. Enable the site and required modules:
      ```bash
      sudo a2ensite fitness-tracker
      sudo a2enmod headers deflate rewrite
      sudo mkdir -p /var/www/fitness-tracker
      sudo cp -r * /var/www/fitness-tracker/
      sudo apache2ctl configtest  # Test configuration
      sudo systemctl restart apache2
      ```

   ### Using Python (For Development):
   ```bash
   cd Fitness-Tracker
   python -m http.server 8000
   ```

   ### Using Node.js (For Development):
   ```bash
   cd Fitness-Tracker
   # Install a simple http server
   npm install -g http-server
   # Run it
   http-server
   ```

3. Access the application:
   - Nginx/Apache2: `http://your-domain.com` or `http://localhost`
   - Python: `http://localhost:8000`
   - Node.js: `http://localhost:8080`

## Project Structure

```
Fitness-Tracker/
├── index.html          # Main application entry point
├── service-worker.js   # PWA service worker for offline support
├── js/
│   ├── app.js         # Main application logic
│   ├── calendar.js    # Calendar functionality
│   ├── cardio.js      # Cardio workout tracking
│   ├── meals.js       # Meal logging and tracking
│   ├── storage.js     # Local storage management
│   ├── ui.js          # User interface components
│   ├── utils.js       # Utility functions
│   ├── weightlifting.js # Weightlifting workout tracking
│   └── workouts.js    # General workout management
└── styles/
    └── main.css       # Application styling
```

## Usage

1. **Dashboard (Alt + 1)**: View your overall fitness progress and recent activities
2. **Weightlifting (Alt + 2)**: Log and track your weightlifting workouts
3. **Cardio (Alt + 3)**: Record your cardio sessions
4. **Goals (Alt + 4)**: Set and monitor your fitness goals
5. **Settings (Alt + 5)**: Customize your app preferences

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Progressive Web App (PWA) features
- Local Storage API
- Service Workers for offline functionality

## Data Privacy

All data is stored locally in your browser using the Local Storage API. No data is sent to external servers, ensuring your fitness information remains private and secure.
