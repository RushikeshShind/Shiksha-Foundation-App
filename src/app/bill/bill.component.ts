import { Component, OnInit } from '@angular/core';
import { BillService } from '../bill/bill.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Bill {
  id?: string;
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
  bankName?: string;
  chequeNo?: string;
  chequeDate?: string;
}

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  providers: [BillService]
})
export class BillComponent implements OnInit {
pdfUrl: any;
downloadExcel() {
throw new Error('Method not implemented.');
}
viewPDF() {
throw new Error('Method not implemented.');
}
showChequeFields: any;
toggleChequeFields() {
throw new Error('Method not implemented.');
}
submitBill() {
throw new Error('Method not implemented.');
}
  bills: Bill[] = [];
  bill: Bill = this.getEmptyBill();
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string = '';
  downloadedFilePath: string = ''; // Path where the file will be saved

  constructor(private billService: BillService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadBills();
    this.fetchLoggedInUser();
  }

  loadBills(): void {
    this.isLoading = true;
    this.billService.getBills().subscribe({
      next: (bills) => {
        this.bills = bills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching bills:', err);
        this.errorMessage = 'Failed to load bills. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  fetchLoggedInUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.bill.volunteerName = user.name;
    } else {
      console.warn('No logged-in user found.');
    }
  }

  // ✅ Download Bill PDF
  downloadPDF(billId?: string): void {
    if (!billId) return;

    this.successMessage = '';
    this.downloadedFilePath = '';

    this.isLoading = true; // Set loading state to true while downloading

    this.billService.downloadBillPDF(
      billId, // Bill ID
      (isLoading) => { this.isLoading = isLoading; }, // Loading state callback
      (filePath) => { // Success callback
        this.downloadedFilePath = filePath;
        this.successMessage = `File downloaded successfully! It is located at: ${filePath}`;
        this.isLoading = false; // Set loading state to false after download
      },
      (error) => {  // Error callback
        console.error('Error downloading file:', error);
        this.successMessage = 'Error downloading file. Please try again.';
        this.isLoading = false;
      }
    );
  }

  // Open downloaded file (Provide option to view the file)
  viewFile(): void {
    if (this.downloadedFilePath) {
      window.open(this.downloadedFilePath, '_blank'); // Open the file in a new tab
    } else {
      alert('No file to view!');
    }
  }

  // ✅ Convert Amount Number to Words
  convertAmountToWords(): void {
    const number = this.bill.amountNumber;
    if (number <= 0) {
      this.bill.amountWords = '';
      return;
    }

    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convert(n: number): string {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100);
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand ' + convert(n % 1000);
      return convert(Math.floor(n / 100000)) + ' Lakh ' + convert(n % 100000);
    }

    this.bill.amountWords = convert(number) + ' Rupees Only';
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
      chequeDetails: '',
      volunteerName: this.bill.volunteerName || '',
      remark: '',
      alternativeNo: '',
      bankName: '',
      chequeNo: '',
      chequeDate: ''
    };
  }

  private isValidBill(bill: Bill): boolean {
    return bill.date.trim() !== '' && bill.name.trim() !== '' && bill.amountNumber > 0;
  }
}
