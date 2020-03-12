import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslationBaseComponent } from '../../@shared/language-base/translation-base.component';
import { TranslateService } from '@ngx-translate/core';
import { EquipmentSharing } from '@gauzy/models';
import { LocalDataSource } from 'ng2-smart-table';
import { FormGroup } from '@angular/forms';
import { EquipmentSharingService } from '../../@core/services/equipment-sharing.service';

@Component({
	templateUrl: './equipment-sharing.component.html',
	styleUrls: ['./equipment-sharing.component.scss']
})
export class EquipmentSharingComponent extends TranslationBaseComponent
	implements OnInit {
	settingsSmartTable: object;
	loading = true;
	selectedEquipmentSharing: EquipmentSharing;
	smartTableSource = new LocalDataSource();
	form: FormGroup;
	disableButton = true;

	@ViewChild('equipmentSharingTable', { static: false })
	equipmentSharingTable;

	constructor(
		readonly translateService: TranslateService,
		private equipmentSharingService: EquipmentSharingService
	) {
		super(translateService);
	}

	ngOnInit(): void {
		this.loadSmartTable();
		this._applyTranslationOnSmartTable();
		this.loadSettings();
	}

	async loadSmartTable() {
		this.settingsSmartTable = {
			actions: false,
			columns: {
				equipmentName: {
					title: this.getTranslation(
						'EQUIPMENT_SHARING_PAGE.EQUIPMENT_NAME'
					),
					type: 'string'
				},
				shareRequestDate: {
					title: this.getTranslation(
						'EQUIPMENT_SHARING_PAGE.SHARE_REQUIEST_DATE'
					),
					type: 'string'
				},
				shareStartDate: {
					title: this.getTranslation(
						'EQUIPMENT_SHARING_PAGE.SHARE_START_DATE'
					),
					type: 'string'
				},
				shareEndDate: {
					title: this.getTranslation(
						'EQUIPMENT_SHARING_PAGE.SHARE_END_DATE'
					),
					type: 'string'
				},
				status: {
					title: this.getTranslation('EQUIPMENT_SHARING_PAGE.STATUS'),
					type: 'string'
				}
			}
		};
	}

	async save() {}

	async delete() {}

	async loadSettings() {
		this.selectedEquipmentSharing = null;
		const { items } = await this.equipmentSharingService.getAll();
		this.loading = false;
		this.smartTableSource.load(items);
	}

	_applyTranslationOnSmartTable() {
		this.translateService.onLangChange.subscribe(() => {
			this.loadSmartTable();
		});
	}
}
