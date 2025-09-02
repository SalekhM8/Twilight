# Twilight Pharmacy - Complete Healthcare Management System

A modern, full-stack pharmacy website with intelligent consultation booking and comprehensive admin management system.

## 🌟 Features

### **Front-of-House Website**
- **Modern Design**: Clean, professional aesthetic matching healthcare industry standards
- **Treatment Showcase**: Interactive cards displaying all available services with pricing
- **Location Information**: Complete details for all 3 Birmingham pharmacy locations
- **Intelligent Search**: Dynamic treatment and service search functionality
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### **Smart Consultation Booking**
- **Dynamic Filtering**: Intelligent form that shows only available options based on selections
- **Treatment-Location Matching**: Only displays locations that offer the selected treatment
- **Pharmacist Assignment**: Choose specific pharmacist or auto-assign based on availability
- **Real-time Validation**: Instant feedback and error handling
- **Booking Confirmation**: Professional confirmation page with all appointment details

### **Professional Admin Dashboard**
- **Clean Interface**: Soft, modern design inspired by premium business applications
- **Comprehensive Analytics**: Real-time statistics and performance metrics
- **Booking Management**: View, confirm, and manage all customer appointments
- **Multi-location Support**: Manage operations across all pharmacy locations
- **Secure Authentication**: Protected admin access with role-based permissions

### **Database Management**
- **Relational Design**: Properly structured database with foreign key relationships
- **Scalable Architecture**: Built to handle growth and additional features
- **Data Integrity**: Comprehensive validation and constraint enforcement
- **Audit Trail**: Track all changes and updates for compliance

## 🏥 Pharmacy Locations

### Small Health (SH)
- **Address**: 309 Bolton rd, Small heath Birmingham B10 0AU
- **Phone**: 0121 772 5955
- **Hours**: Mon-Fri 09:00-21:00, Sat 12:00-20:00, Sun 12:00-20:00

### Kings Heath Branch (KH)
- **Address**: 128-130 High St, King's Heath, Birmingham, B14 7LG
- **Phone**: 0121 444 1179
- **Hours**: Mon-Fri 09:00-19:00, Sat 09:00-17:00, Sun 10:00-16:00

### Billesley (BL)
- **Address**: 698 Yardley Wood Rd, Billesley, Birmingham B13 0HY
- **Phone**: 0121 443 4559
- **Hours**: Mon-Fri 08:30-18:30, Sat 09:00-17:00, Sun Closed

## 💊 Available Treatments

- **Weight Loss** - £50.00 (30 mins) - Available at all locations
- **Women's Health** - £45.00 (25 mins) - Small Health & Kings Heath
- **Digestion** - £40.00 (20 mins) - Available at all locations
- **Erectile Dysfunction** - £55.00 (30 mins) - Small Health & Billesley
- **Facial Hair Removal** - £35.00 (45 mins) - Kings Heath only
- **Hair Loss** - £60.00 (30 mins) - Available at all locations
- **Hay Fever and Allergy** - £30.00 (20 mins) - Available at all locations
- **Ear Wax Removal** - £25.00 (15 mins) - Small Health & Kings Heath
- **HGV, PCV & Taxi Medicals** - £80.00 (45 mins) - Billesley only

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**
   \`\`\`bash
   cd twilight-pharmacy
   npm install
   \`\`\`

2. **Set up the database**
   \`\`\`bash
   npx prisma migrate dev --name init
   npx tsx prisma/seed.ts
   \`\`\`

3. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Access the application**
   - **Website**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin/login

### Admin Access
- **Email**: admin@twilightpharmacy.com
- **Password**: admin123

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Database**: SQLite with Prisma ORM
- **Authentication**: Custom JWT-based system
- **API**: Next.js API Routes
- **Deployment**: Vercel-ready

## 📱 Key User Journeys

### **Customer Booking Flow**
1. Browse treatments on homepage
2. Click "Book Consultation" on desired treatment
3. System intelligently filters available locations
4. Choose pharmacist or select "Don't mind"
5. Enter personal details and preferred time
6. Receive booking confirmation with reference number

### **Admin Management Flow**
1. Secure login to admin dashboard
2. View real-time statistics and recent bookings
3. Manage pharmacist schedules and assignments
4. Update treatment availability and pricing
5. Confirm appointments and manage customer communications

## 🎨 Design Philosophy

The application follows modern healthcare design principles:

- **Clean & Professional**: Minimal clutter, focus on essential information
- **High Contrast**: Excellent readability for all users
- **Generous Spacing**: Comfortable layout with proper whitespace
- **Intuitive Navigation**: Self-explanatory interface requiring no training
- **Consistent Branding**: Twilight blue theme throughout all components

## 🔒 Security Features

- **Input Validation**: Comprehensive server-side and client-side validation
- **SQL Injection Protection**: Prisma ORM prevents injection attacks
- **Authentication**: Secure admin login with password hashing
- **Data Privacy**: Customer information properly protected and encrypted

## 📊 Admin Dashboard Features

- **Real-time Analytics**: Live booking statistics and trends
- **Booking Management**: Complete appointment lifecycle management
- **Staff Management**: Pharmacist scheduling and assignment tools
- **Treatment Management**: Pricing and availability controls
- **Location Management**: Multi-site operation support
- **Reporting**: Comprehensive business intelligence tools

## 🌐 API Endpoints

- \`GET /api/treatments\` - List all available treatments
- \`GET /api/locations\` - List all pharmacy locations
- \`GET /api/pharmacists\` - List all active pharmacists
- \`POST /api/bookings\` - Create new consultation booking
- \`GET /api/bookings\` - Admin: List all bookings
- \`POST /api/admin/login\` - Admin authentication

## 📈 Future Enhancements

- **SMS Notifications**: Appointment reminders and confirmations
- **Online Payments**: Secure payment processing integration
- **Calendar Integration**: Sync with Google Calendar and Outlook
- **Customer Portal**: Account management and booking history
- **Advanced Reporting**: Business intelligence and analytics
- **Multi-language Support**: Serve diverse Birmingham community

## 📞 Support

For technical support or business inquiries, please contact the development team or visit any of our pharmacy locations.

---

**Built with ❤️ for Twilight Pharmacy - More than just a Pharmacy**