import { PermissionsEnum, IPagination, IOrganizationTeam } from '@gauzy/contracts';
import {
	Controller,
	Get,
	HttpStatus,
	Query,
	Post,
	Body,
	HttpCode,
	Put,
	Param,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CrudController, PaginationParams } from './../core/crud';
import { TenantPermissionGuard, PermissionGuard } from './../shared/guards';
import { ParseJsonPipe, UUIDValidationPipe } from './../shared/pipes';
import { Permissions } from './../shared/decorators';
import { CreateOrganizationTeamDTO, UpdateOrganizationTeamDTO } from './dto';
import { OrganizationTeam } from './organization-team.entity';
import { OrganizationTeamService } from './organization-team.service';

@ApiTags('OrganizationTeam')
@UseGuards(TenantPermissionGuard, PermissionGuard)
@Permissions(PermissionsEnum.ALL_ORG_EDIT)
@Controller()
export class OrganizationTeamController extends CrudController<OrganizationTeam> {
	constructor(
		private readonly organizationTeamService: OrganizationTeamService
	) {
		super(organizationTeamService);
	}

	/**
	 * GET find my organization teams
	 *
	 * @param data
	 * @returns
	 */
	@ApiOperation({
		summary: 'Find all organization Teams.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found Teams',
		type: OrganizationTeam
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Permissions()
	@Get('me')
	async findMyTeams(
		@Query('data', ParseJsonPipe) data: any
	): Promise<IPagination<IOrganizationTeam>> {
		const { relations, findInput, employeeId } = data;
		return await this.organizationTeamService.findMyTeams(
			relations,
			findInput,
			employeeId
		);
	}

	/**
	 * GET organization teams by pagination
	 *
	 * @param params
	 * @returns
	 */
	@Permissions(PermissionsEnum.ALL_ORG_VIEW)
	@Get('pagination')
	@UsePipes(new ValidationPipe({ transform: true }))
	async pagination(
		@Query() params: PaginationParams<OrganizationTeam>
	): Promise<IPagination<IOrganizationTeam>> {
		return await this.organizationTeamService.pagination(params);
	}

	/**
	 * GET organization teams
	 *
	 * @param params
	 * @returns
	 */
	@ApiOperation({
		summary: 'Find all organization Teams.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found Teams',
		type: OrganizationTeam
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Permissions(PermissionsEnum.ALL_ORG_VIEW)
	@Get()
	@UsePipes(new ValidationPipe())
	async findAll(
		@Query() params: PaginationParams<OrganizationTeam>
	): Promise<IPagination<IOrganizationTeam>> {
		return await this.organizationTeamService.findAll(params);
	}

	/**
	 * CREATE organization team
	 *
	 * @param entity
	 * @returns
	 */
	@ApiOperation({ summary: 'Create new record' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.' /*, type: T*/
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.OK)
	@Post()
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async create(
		@Body() entity: CreateOrganizationTeamDTO
	): Promise<IOrganizationTeam> {
		return await this.organizationTeamService.create(entity);
	}

	/**
	 * UPDATE organization team by id
	 *
	 * @param id
	 * @param entity
	 * @returns
	 */
	@ApiOperation({ summary: 'Update an organization Team' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully edited.'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@Put(':id')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async update(
		@Param('id', UUIDValidationPipe) id: string,
		@Body() entity: UpdateOrganizationTeamDTO
	): Promise<IOrganizationTeam> {
		return await this.organizationTeamService.update(id, entity);
	}
}
