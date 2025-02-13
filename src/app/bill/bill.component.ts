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
viewBill(arg0: string|undefined) {
throw new Error('Method not implemented.');
}
downloadPDF(arg0: string|undefined) {
throw new Error('Method not implemented.');
}
downloadExcel() {
throw new Error('Method not implemented.');
}
convertAmountToWords() {
throw new Error('Method not implemented.');
}
  bills: Bill[] = [];
  bill: Bill = this.getEmptyBill();
  isLoading = false;
  errorMessage: string | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  showModal = false;
  loggedInUser: string | null = null;
  showChequeFields = false;

  constructor(private billService: BillService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadBills();
    this.fetchLoggedInUser();
  }

  toggleChequeFields(): void {
    this.showChequeFields = !!this.bill.chequeDetails; 
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
    this.billService.getLoggedInUser().subscribe({
      next: (user: { name: string }) => {
        this.loggedInUser = user.name;
        this.bill.volunteerName = user.name;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching logged-in user:', error);
      }
    });
  }

  submitBill(): void {
    if (!this.isValidBill(this.bill)) {
      alert('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    this.billService.saveBill(this.bill).subscribe({
      next: (savedBill) => {
        alert('Bill saved successfully!');
        this.bills.push(savedBill);
        this.bill = this.getEmptyBill();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error saving bill:', err);
        this.errorMessage = 'Failed to save the bill. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
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
      volunteerName: this.loggedInUser || '',
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
