import { MessageFileType, MessageType } from '@domain/models';
import { FileModel } from '@presentation/protocols';

export interface CreateContactMessageDTO {
	sender: {
		id: string;
		key: string;
		contactId: string;
	};
	receiver: {
		id: string;
		key: string;
		contactId: string;
	};

	replyId?: string;

	message?: string;
	type: MessageType;

	files: Array<{
		file: FileModel;
		type: MessageFileType;

		users: Array<{
			id: string;
			key: string;
		}>;
	}>;
}
