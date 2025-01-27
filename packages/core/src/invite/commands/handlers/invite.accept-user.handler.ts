import { IInvite, InviteStatusEnum } from '@gauzy/contracts';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateResult } from 'typeorm';
import { AuthService } from '../../../auth/auth.service';
import { InviteService } from '../../invite.service';
import { InviteAcceptUserCommand } from '../invite.accept-user.command';
import { OrganizationService } from '../../../organization/organization.service';

/**
 * Use this command for registering all non-employee users.
 * This command first registers a user, then creates a user_organization relation.
 * If the above two steps are successful, it finally sets the invitation status to accepted
 */
@CommandHandler(InviteAcceptUserCommand)
export class InviteAcceptUserHandler
	implements ICommandHandler<InviteAcceptUserCommand> {
	constructor(
		private readonly inviteService: InviteService,
		private readonly authService: AuthService,
		private readonly organizationService: OrganizationService
	) {}

	public async execute(
		command: InviteAcceptUserCommand
	): Promise<UpdateResult | IInvite> {
		const { input, languageCode } = command;

		const organization = await this.organizationService.findOneByIdString(
			input.organization.id,
			{ relations: ['tenant'] }
		);

		await this.authService.register(
			{
				...input,
				user: {
					...input.user,
					tenant: organization.tenant
				},
				organizationId: organization.id
			},
			languageCode
		);

		return await this.inviteService.update(input.inviteId, {
			status: InviteStatusEnum.ACCEPTED
		});
	}
}
