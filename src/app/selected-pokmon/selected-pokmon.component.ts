import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pokemon } from '../models/pokemon.model';
import { typeColors } from 'src/app/shared/pokemon-type-colors';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-selected-pokmon',
  templateUrl: './selected-pokmon.component.html',
  styleUrls: ['./selected-pokmon.component.css']
})
export class SelectedPokmonComponent implements OnInit {
  pokemon : Pokemon;
  pokemonId : number;
  typeColors : {[key:string] : string} = {}

  isDataAvailable : boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    this.typeColors = typeColors;
    this.route.params.subscribe((res) => this.pokemonId = (res.id));

    this.http.get("https://pokeapi.co/api/v2/pokemon/"+(this.pokemonId)).subscribe(
      (res) => {
        this.pokemon = new Pokemon(res['id'],res['name'],res['height'],res['weight'],res['abilities'],res['types'],res['stats']);

      }
    )

    this.http.get("https://pokeapi.co/api/v2/pokemon-species/"+(this.pokemonId))
    .subscribe(
      (res) => {
        this.pokemon.details = res['flavor_text_entries'][0].flavor_text;
        this.isDataAvailable = true;

        this.http.get(res['evolution_chain'].url)
        .pipe(
          map(
            (res) => {
              var evoChain = [];
              var evoData = res['chain'];
              do {
                var evoDetails = evoData['evolution_details'][0];
                evoChain.push({
                  "species_name": evoData.species.name,
                  "min_level": !evoDetails ? 1 : evoDetails.min_level,
                  "trigger_name": !evoDetails ? null : evoDetails.trigger.name,
                  "item": !evoDetails ? null : evoDetails.item
                });
                evoData = evoData['evolves_to'][0];
              } while (!!evoData && evoData.hasOwnProperty('evolves_to'));
              return evoChain;
            }
          )
        )
        .subscribe(
          (evolutionData) => {
            this.pokemon["evolution"] = evolutionData;
            // this.isDataAvailable = true;
          }
        )

      }
    )

  }

  onClickClose(){
    this.router.navigate(['']);
  }

}
