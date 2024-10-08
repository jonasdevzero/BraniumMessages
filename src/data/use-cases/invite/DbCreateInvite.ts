import { inject, injectable } from '@container';
import {
	CreateInviteRepository,
	ExistsInviteRepository,
	ExistsProfileRepository,
	GetFileUrlProvider,
	WebSocketServer,
} from '@data/protocols';
import { ExistsContactRepository } from '@data/protocols/db/contact';
import { CreateInviteDTO } from '@domain/dtos/invite';
import { CreateInvite } from '@domain/use-cases/invite';
import { BadRequestError, NotFoundError } from '@presentation/errors';

@injectable()
export class DbCreateInvite implements CreateInvite {
	constructor(
		@inject('ExistsProfileRepository')
		private readonly existsProfileRepository: ExistsProfileRepository,

		@inject('ExistsInviteRepository')
		private readonly existsInviteRepository: ExistsInviteRepository,

		@inject('ExistsContactRepository')
		private readonly existsContactRepository: ExistsContactRepository,

		@inject('CreateInviteRepository')
		private readonly createInviteRepository: CreateInviteRepository,

		@inject('GetFileUrlProvider')
		private readonly getFileUrlProvider: GetFileUrlProvider,

		@inject('WebSocketServer')
		private readonly ws: WebSocketServer
	) {}

	async create(data: CreateInviteDTO): Promise<void> {
		const { senderId, receiverId } = data;

		const [
			senderExists,
			receiverExists,
			alreadySent,
			alreadyReceived,
			existsContact,
		] = await Promise.all([
			this.existsProfileRepository.exists(senderId),
			this.existsProfileRepository.exists(receiverId),
			this.existsInviteRepository.exists(data),
			this.existsInviteRepository.exists({
				senderId: receiverId,
				receiverId: senderId,
			}),
			this.existsContactRepository.exists({
				userId: senderId,
				contactId: receiverId,
			}),
		]);

		if (!senderExists) {
			throw new NotFoundError('Sender');
		}

		if (!receiverExists) {
			throw new NotFoundError('Receiver');
		}

		if (alreadySent) {
			throw new BadRequestError('Invite already sent');
		}

		if (alreadyReceived) {
			throw new BadRequestError('Invite already received');
		}

		if (existsContact) {
			throw new BadRequestError('Contact already exists');
		}

		const invite = await this.createInviteRepository.create(data);

		if (invite.sender.image) {
			const url = await this.getFileUrlProvider.get(invite.sender.image);
			Object.assign(invite.sender, { image: url });
		}

		this.ws.emit([receiverId], 'invite:new', invite);
	}
}
