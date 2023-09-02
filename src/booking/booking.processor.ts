import { BookingService } from './booking.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

// Processor 등록 시 QueueName을 사용해준다.
@Processor('Ticket')
export class BookingProcessor {
  constructor(private readonly bookingService: BookingService) {}

  // 특정 Job을 동작시키기 위해 Process에 job name을 사용해준다.
  // 'createBooking'으로 작성
  @Process({ name: 'createBooking', concurrency: 3 })
  async createBooking(job: Job<unknown>) {
    // Job을 변수로 사용, Queue에 Job이 등록되면 Job을 가져온다.
    const bookingData = job.data;
    // createBooking 메서드를 통해 예매 진행
    const createBooking = await this.bookingService.createBooking(bookingData);
    console.log(createBooking);
  }
}
