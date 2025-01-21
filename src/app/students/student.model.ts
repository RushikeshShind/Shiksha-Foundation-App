export interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    dob: string;
    address: string;
    description: string;
    marksheetUrl: string;
    certificateUrl?: string;
    marksheetName?: string;
    certificateName?: string;
    profileImage: string;  // Add profileImage property
    // Add other fields as necessary
  }