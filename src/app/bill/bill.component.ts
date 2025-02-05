import { Component, OnInit } from '@angular/core';
import { BillService } from '../bill/bill.service'; // Import BillService
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel binding
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngFor etc.
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule for making HTTP requests
import { AuthService } from '../auth.service';

// Define an interface for the bill structure
interface Bill {
  date: string;
  name: string;
  msName: string;
  amountNumber: number;
  amountWords: string;
  address: string;
  mobileNo: string;
  alternativeNo?: string;
  email: string;
  pancardNo: string;
  purpose: string;
  transactionId: string;
  chequeDetails?: string;
  remark?: string;
  volunteerName: string;
  id?: string; // Optional for new bills before saving
}

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css'],
  standalone: true,
  imports: [
    FormsModule,    // Import FormsModule for ngModel two-way binding
    CommonModule,   // Import CommonModule for ngIf, ngFor etc.
    HttpClientModule, // Import HttpClientModule for HTTP calls
  ],
  providers: [BillService] // Provide the BillService directly in this standalone component
})
export class BillComponent implements OnInit {
  // Initialize a new bill object
  bill: Bill = this.getEmptyBill();

  // Array to store all bills
  bills: Bill[] = [];

  constructor(private billService: BillService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadBills();
    this.bill.volunteerName = this.getVolunteerName(); // Auto-fill volunteer name
  }

  // Submit a new bill
  submitBill(): void {
    if (this.isValidBill(this.bill)) {
      this.billService.saveBill(this.bill).subscribe({
        next: () => {
          alert('Bill saved successfully!');
          this.loadBills(); // Reload the bills list
          this.bill = this.getEmptyBill(); // Reset the form
        },
        error: (err) => {
          console.error('Error saving bill:', err);
          alert('Failed to save the bill. Please try again.');
        }
      });
    } else {
      alert('Please fill in all required fields.');
    }
  }

  // Load all bills
  loadBills(): void {
    this.billService.getBills().subscribe({
      next: (bills) => {
        this.bills = bills;
      },
      error: (err) => {
        console.error('Error fetching bills:', err);
        alert('Failed to load bills. Please try again.');
      }
    });
  }

  // Download bill PDF
  downloadPDF(billId: string | undefined): void {
    if (billId) {
      console.log('Downloading PDF for bill ID:', billId);
      this.billService.downloadBillPDF(billId).subscribe({
        next: (response: Blob) => {
          this.triggerFileDownload(response, `Bill_${billId}.pdf`);
        },
        error: (err) => {
          console.error('Error downloading PDF:', err);
          alert('Failed to download the PDF. Please try again.');
        }
      });
    } else {
      alert('Bill ID is undefined.');
    }
  }

  // View the bill (open PDF in new tab)
  viewBill(billId: string | undefined): void {
    if (billId) {
      this.billService.downloadBillPDF(billId).subscribe({
        next: (response: Blob) => {
          const fileURL = URL.createObjectURL(response);
          window.open(fileURL, '_blank'); // Opens the PDF in a new tab
        },
        error: (err) => {
          console.error('Error viewing PDF:', err);
          alert('Failed to view the PDF. Please try again.');
        }
      });
    } else {
      alert('Bill ID is undefined.');
    }
  }

  // Convert amount in numbers to words
  convertAmountToWords(): void {
    this.bill.amountWords = this.numberToWords(this.bill.amountNumber);
  }

  // Function to convert number to words (simple implementation)
  private numberToWords(amount: number): string {
    return amount.toString(); // Replace with actual conversion logic
  }

  // Get volunteer name based on login (placeholder implementation)
  private getVolunteerName(): string {
    const user = this.authService.getLoggedInUser();
    return user?.name || 'Unknown Volunteer'; // Fallback if user is not found
  }

  // Helper function to reset the bill object
  private getEmptyBill(): Bill {
    return {
      date: '',
      name: '',
      msName: '',
      amountNumber: 0,
      amountWords: '',
      address: '',
      mobileNo: '',
      email: '',
      pancardNo: '',
      purpose: '',
      transactionId: '',
      volunteerName: this.getVolunteerName() // Keep volunteer name after reset
    };
  }

  // Validate bill inputs
  private isValidBill(bill: Bill): boolean {
    return (
      bill.date.trim() !== '' &&
      bill.name.trim() !== '' &&
      bill.msName.trim() !== '' &&
      bill.amountNumber > 0 &&
      bill.address.trim() !== '' &&
      bill.mobileNo.trim() !== '' &&
      bill.email.trim() !== '' &&
      bill.pancardNo.trim() !== '' &&
      bill.purpose.trim() !== '' &&
      bill.transactionId.trim() !== '' &&
      bill.volunteerName.trim() !== ''
    );
  }

  // Trigger file download
  private triggerFileDownload(blob: Blob, fileName: string): void {
    const fileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
