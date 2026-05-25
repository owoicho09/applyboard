# ApplyBoard Africa Ltd

A comprehensive education and travel consulting platform built with PHP and MySQL.

## 🌍 Overview

ApplyBoard Africa Ltd is a digital platform for education and travel consulting services. It enables:

- **Study Abroad Consulting** - University applications and admissions support
- **Visa Assistance** - Student, tourist, and family visa processing
- **Travel Services** - Flights, hotels, and travel planning
- **Agent Referral System** - Commission-based agent network
- **Digital Application Tracking** - Real-time case progress monitoring

## 🚀 Quick Start

### Requirements

- PHP 7.4+
- MySQL 5.7+ / MariaDB 10.4+
- Apache with mod_rewrite
- Composer (for dependencies)

### Installation

1. **Clone to your web directory:**

   ```bash
   git clone <repository-url> /var/www/html/smile-dove
   # or for XAMPP
   git clone <repository-url> /opt/lampp/htdocs/smile-dove
   ```

2. **Create the database:**

   ```bash
   mysql -u root -p -e "CREATE DATABASE sdtravels;"
   ```

3. **Import the schema:**

   ```bash
   mysql -u root -p sdtravels < config/Sprint1_Complete_Schema.sql
   ```

4. **Install dependencies:**

   ```bash
   composer install
   ```

5. **Configure database connection:**
   Edit `config/config.php` with your database credentials:

   ```php
   $host = "localhost";
   $user = "root";
   $pass = "";
   $db = "sdtravels";
   ```

6. **Create an admin account:**
   ```sql
   INSERT INTO admin (fullname, email, password, status)
   VALUES ('Admin', 'admin@example.com', 'your_password', 'active');
   ```

### Access Points

| Portal          | URL                  | Description              |
| --------------- | -------------------- | ------------------------ |
| Public Website  | `/`                  | Marketing pages          |
| Client Portal   | `/user/login.php`    | Student/client dashboard |
| Agent Dashboard | `/agent/login.php`   | Agent management         |
| Admin Panel     | `/manager/login.php` | System administration    |

## 📁 Project Structure

```
smile-dove/
├── index.php              # Homepage
├── about.php              # About page
├── services.php           # Services page
├── agents.php             # Agents info
├── platform.php           # Platform features
├── contact.php            # Inquiry form
│
├── config/                # Configuration
│   ├── config.php         # Database connection
│   ├── auth_helper.php    # Authentication functions
│   ├── case_helper.php    # Case management
│   └── function.php       # Utility functions
│
├── user/                  # Client/Student portal
│   ├── index.php          # Dashboard
│   ├── cases.php          # View cases
│   ├── documents.php      # Document management
│   └── ...
│
├── agent/                 # Agent dashboard
│   ├── index.php          # Dashboard
│   ├── clients.php        # Referred clients
│   ├── commissions.php    # Earnings
│   └── ...
│
├── manager/               # Admin panel
│   ├── index.php          # Dashboard
│   ├── agents.php         # Agent verification
│   ├── cases.php          # Case management
│   └── ...
│
├── uploads/               # File storage
├── vendor/                # Composer packages
└── css/, js/, images/     # Assets
```

## 🗄️ Database Schema

| Table                 | Description                     |
| --------------------- | ------------------------------- |
| `admin`               | Administrator accounts          |
| `agents`              | Agent profiles and verification |
| `users`               | Client/student accounts         |
| `inquiries`           | Contact form submissions        |
| `cases`               | Application/service cases       |
| `documents`           | Uploaded files                  |
| `commissions`         | Agent earnings                  |
| `payments`            | Payment records                 |
| `notifications`       | System notifications            |
| `activity_logs`       | Audit trail                     |
| `case_stages_history` | Case progress tracking          |
| `agent_performance`   | Agent ratings                   |
| `settings`            | System configuration            |

## 👥 User Roles

### Visitor

- Browse public pages
- Submit inquiries
- Register as client

### Client/Student

- Track application cases
- Upload documents
- View case progress
- Make payments

### Agent

- Register and get verified
- Refer clients via unique link
- Manage client cases
- Track commissions

### Admin/Manager

- Verify agents
- Manage all cases
- Approve commissions
- System configuration
- View reports

## 🔗 Referral System

1. Verified agents receive a unique referral link:

   ```
   https://domain.com/user/register.php?ref=AGT-XXXXXX
   ```

2. Clients who register via the link are permanently linked to the agent

3. Agents earn commissions on completed cases

## 📋 Case Types

| Type         | Stages                                                                           |
| ------------ | -------------------------------------------------------------------------------- |
| Study Abroad | Assessment → Options → Application → Submission → Offer → Visa → Travel → Closed |
| Visa         | Assessment → Documents → Submission → Decision → Closed                          |
| Travel       | Requirements → Booking → Completed → Closed                                      |

## 🔒 Security Features

- Password hashing with bcrypt
- Session-based authentication
- SQL injection prevention
- XSS protection
- File upload validation

## 📖 Documentation

See [GUIDE.md](GUIDE.md) for detailed system documentation including:

- Complete API reference
- Workflow diagrams
- Configuration options
- Troubleshooting guide

## 🛠️ Development

### Technology Stack

- **Backend:** PHP 7.4+
- **Database:** MySQL/MariaDB
- **Frontend:** HTML5, CSS3, Bootstrap
- **JavaScript:** jQuery
- **Email:** PHPMailer
- **Payments:** Paystack integration

### Running Locally

```bash
# Start XAMPP/LAMPP
sudo /opt/lampp/lampp start

# Access the site
http://localhost/smile-dove/
```

## 📄 License

Proprietary - ApplyBoard Africa Ltd

## 🤝 Support

For technical support, contact Digitide Systems Technologies Ltd.

---

**ApplyBoard Africa Ltd** - Your Gateway to Global Education and Travel
