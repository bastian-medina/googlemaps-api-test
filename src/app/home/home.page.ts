import { Component,OnInit,ViewChild,ElementRef, NgZone } from '@angular/core';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

declare var google;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('map',{static:false}) mapElement: ElementRef;
  map:any;
  address:string;
  lat:string;
  long:string;
  location:any;
  placeid:any;
  autocomplete:{input:string};
  autocompleteItems:any[];
  GoogleAutocomplete:any;

  constructor(private geolocation:Geolocation,private nativeGeocoder:NativeGeocoder, public zone:NgZone) {
      this.autocomplete = {input:''}
      this.autocompleteItems = []
      this.GoogleAutocomplete = new google.maps.places.AutocompleteService();

  }

  ngOnInit(){
    this.loadMap();
  }

  ShowCords(){
    console.log(this.lat+" "+this.long);
  }

  loadMap(){
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);

      this.map = new google.maps.Map(this.mapElement.nativeElement,mapOptions);
      this.map.addListener('tilesloaded',()=>{
        this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
        this.lat = this.map.center.lat();
        this.long = this.map.center.lng();
      });
    }).catch((error)=>{
        console.log(error);
    });
  }

  getAddressFromCoords(latitude,longitude){
    console.log("getAddressFromCoords "+latitude+" "+longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    }
    this.nativeGeocoder.reverseGeocode(latitude, longitude, options).then((result: NativeGeocoderResult[]) => {
      this.address = "";
      let responseAddress = [];
      for (let [key,value] of Object.entries(result[0])){
        if(value.length>0){
          responseAddress.push(value);
        }
      }
      responseAddress.reverse();

      for (let value of responseAddress){
        this.address+=value+", ";
      }
      this.address = this.address.slice(0, -2);

    }).catch((error: any) =>
    {
      this.address = "Address Not Available!";
    });
    
  }

  ClearAutocomplete(){
    this.autocompleteItems = [];
    this.autocomplete.input = '';
  }

  SelectSearchResult(item){
    alert(JSON.stringify(item));
    this.placeid = item.place_id;
  }

  UpdateSearchResults(){
    if(this.autocomplete.input== ''){
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({input: this.autocomplete.input},
      (predictions,status) =>{
        this.autocompleteItems = [];
        this.zone.run(()=>{
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      });

  }

}


