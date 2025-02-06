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
  bill: Bill = this.getEmptyBill();
  bills: Bill[] = [];

  constructor(private billService: BillService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadBills();
    this.bill.volunteerName = this.getVolunteerName();
  }

  submitBill(): void {
    if (this.isValidBill(this.bill)) {
      this.billService.saveBill(this.bill).subscribe({
        next: () => {
          alert('Bill saved successfully!');
          this.loadBills();
          this.bill = this.getEmptyBill();
        },
        error: (err: any) => {
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
      error: (err: any) => {
        console.error('Error fetching bills:', err);
        alert('Failed to load bills. Please try again.');
      }
    });
  }

  // View Bill Method
  async viewBill(billId: string | undefined): Promise<void> {
    if (billId) {
      try {
        await this.billService.viewBillPDF(billId); // Call the updated method
      } catch (error) {
        console.error('Error viewing PDF:', error);
        alert('Failed to view the PDF. Please try again.');
      }
    } else {
      alert('Bill ID is undefined.');
    }
  }

  // Download PDF for bill
  async downloadPDF(billId: string | undefined): Promise<void> {
    if (billId) {
      try {
        await this.billService.downloadBillPDF(billId);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Failed to download the PDF. Please try again.');
      }
    } else {
      alert('Bill ID is undefined.');
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

  convertAmountToWords(): void {
    this.bill.amountWords = this.numberToWords(this.bill.amountNumber);
  }

  private numberToWords(amount: number): string {
    const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    return words[amount] || 'Number out of range';
  }
}
