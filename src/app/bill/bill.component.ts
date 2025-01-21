import { Component, OnInit } from '@angular/core';
import { BillService } from '../bill/bill.service'; // Import BillService
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel binding
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngFor etc.
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule for making HTTP requests

// Define an interface for the bill structure
interface Bill {
  vendorName: string;
  address: string;
  adharcard: string;
  phoneNumber: string;
  amount: number;
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
  bill: Bill = {
    vendorName: '',
    address: '',
    adharcard: '',
    phoneNumber: '',
    amount: 0
  };

  // Array to store all bills
  bills: Bill[] = [];

  constructor(private billService: BillService) {}

  ngOnInit(): void {
    this.loadBills();
  }

  // Submit a new bill
  submitBill(): void {
    if (this.isValidBill(this.bill)) {
      this.billService.saveBill(this.bill).subscribe({
        next: () => { // Removed 'response' parameter
          alert('Bill saved successfully!');
          this.loadBills(); // Reload the bills list
          this.resetForm(); // Reset the form
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
      this.billService.downloadBillPDF(billId).subscribe({
        next: (response: Blob) => {
          const fileURL = URL.createObjectURL(response);
          const link = document.createElement('a');
          link.href = fileURL;
          link.download = `Bill_${billId}.pdf`;
          link.click();
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

  // Reset the form
  private resetForm(): void {
    this.bill = {
      vendorName: '',
      address: '',
      adharcard: '',
      phoneNumber: '',
      amount: 0
    };
  }

  // Validate bill inputs
  private isValidBill(bill: Bill): boolean {
    return (
      bill.vendorName.trim() !== '' &&
      bill.address.trim() !== '' &&
      bill.adharcard.trim() !== '' &&
      bill.phoneNumber.trim() !== '' &&
      bill.amount > 0
    );
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
}
