import { Component, OnInit } from '@angular/core';
import { BillService } from '../bill/bill.service'; // Import BillService
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel binding
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngFor etc.
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule for making HTTP requests
import { AuthService } from '../auth.service';

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
    FormsModule,
    CommonModule,
    HttpClientModule,
  ],
  providers: [BillService]
})
export class BillComponent implements OnInit {
  bill: Bill = this.getEmptyBill();
  bills: Bill[] = [];

  constructor(private billService: BillService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadBills();
    this.bill.volunteerName = this.getVolunteerName(); // Auto-fill volunteer name
  }

  submitBill(): void {
    if (this.isValidBill(this.bill)) {
      this.billService.saveBill(this.bill).subscribe({
        next: () => {
          alert('Bill saved successfully!');
          this.loadBills();
          this.bill = this.getEmptyBill();
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

  // Download PDF for bill and save to device
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
          window.open(fileURL, '_blank');
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

  private getVolunteerName(): string {
    const user = this.authService.getLoggedInUser();
    return user?.name || 'Unknown Volunteer'; // Fallback if user is not found
  }

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
      volunteerName: this.getVolunteerName(),
    };
  }

  private isValidBill(bill: Bill): boolean {
    return bill.date.trim() !== '' && bill.name.trim() !== '' && bill.amountNumber > 0;
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

  // Convert amount in numbers to words
  convertAmountToWords(): void {
    this.bill.amountWords = this.numberToWords(this.bill.amountNumber);
  }

  // Function to convert number to words (simple implementation)
  private numberToWords(amount: number): string {
    // A very simple example, you can expand this with better logic or libraries.
    const words = [
      'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'
    ];
    return words[amount] || 'Number out of range';
  }
}
