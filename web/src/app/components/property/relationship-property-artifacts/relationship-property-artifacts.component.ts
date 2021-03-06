import { Component, Input } from '@angular/core';

import { ArtifactResponsePropertyRelationshipBase } from '../../../services/editor/types';

export interface ArtifactsRelationshipPropertyModelWithNullable
  extends ArtifactResponsePropertyRelationshipBase {
  nullable?: boolean;
}

@Component({
  selector: 'app-relationship-property-artifacts',
  templateUrl: './relationship-property-artifacts.component.html',
  styleUrls: ['./relationship-property-artifacts.component.css'],
})
export class RelationshipPropertyArtifactsComponent {
  @Input() artifacts: ArtifactsRelationshipPropertyModelWithNullable;
}
