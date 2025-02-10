import { Component, OnInit } from '@angular/core';
import { BillService } from '../bill/bill.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
  id?: string;
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
convertAmountToWords() {
throw new Error('Method not implemented.');
}
  bill: Bill = this.getEmptyBill();
  bills: Bill[] = [];
  isLoading = false; // ✅ Loading indicator for API requests
  errorMessage: string | null = null; // ✅ Error message handling

  constructor(private billService: BillService, private authService: AuthService) {}

  ngOnInit(): void {
    this.bill.volunteerName = this.getVolunteerName();
    this.loadBills();
  }

  submitBill(): void {
    if (!this.isValidBill(this.bill)) {
      alert('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    this.billService.saveBill(this.bill).subscribe({
      next: () => {
        alert('Bill saved successfully!');
        this.loadBills();
        this.bill = this.getEmptyBill();
      },
      error: (err) => {
        console.error('Error saving bill:', err);
        this.errorMessage = 'Failed to save the bill. Please try again.';
        alert(this.errorMessage);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadBills(): void {
    this.isLoading = true;
    this.billService.getBills().subscribe({
      next: (bills) => {
        this.bills = bills;
        console.log('Fetched Bills:', this.bills); // ✅ Debugging
      },
      error: (err) => {
        console.error('Error fetching bills:', err);
        this.errorMessage = 'Failed to load bills. Please try again.';
        alert(this.errorMessage);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  async viewBill(billId?: string): Promise<void> {
    if (!billId) {
      alert('Bill ID is undefined.');
      return;
    }

    try {
      await this.billService.viewBillPDF(billId);
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Failed to open the PDF. Please try again.');
    }
  }

  async downloadPDF(billId?: string): Promise<void> {
    if (!billId) {
      alert('Bill ID is undefined.');
      return;
    }

    try {
      await this.billService.downloadBillPDF(billId);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download the PDF. Please try again.');
    }
  }

  downloadExcel(): void {
    if (this.bills.length === 0) {
      alert('No bills available to export.');
      return;
    }

    try {
      this.billService.downloadExcel(this.bills);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel file. Please try again.');
    }
  }

  private getVolunteerName(): string {
    const user = this.authService.getLoggedInUser();
    return user?.name || 'Unknown Volunteer';
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
}
