import { Component,OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { debounceTime, map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { EbayItem } from './types';
import { Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-ass3search-form',
  templateUrl: './ass3search-form.component.html',
  styleUrls: ['./ass3search-form.component.css'],

})


export class Ass3searchFormComponent{
  keyword: string = '';
  category: string = '';
  new: string = '';
  used: string = '';
  unspecified: string = '';
  localPickup: string = '';
  freeShipping: string = '';
  distance: string = '';
  currentLocation: string = 'currentLocation';
  other: string = '';
  zipCode: string = '';
  currLoc:string='';
  suggestions: string[] = [];
  items: any[] = [];
  showProductDetails: boolean = false;
  productData: any;
  showImageModal: boolean = false;
  prodInfo:any[] = [];
  shippingInfo: any[] = [];
  shippingInfo1:any[] = [];
  sellerInfo:any[] = [];
  prodImages:any[] = [];

  similarProds:any[] = [];
  displayCount = 5; 
  showAll = false; 
  // currentPage: number = 1;
  // itemsPerPage: number = 10;
   totalItems: number =0;
   totalPages: number =0;
   pages: number[] = [];
   selectedProductitemId: string = '';
buttonC='results';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  allItems: any[] = []; // This will hold all fetched items
  paginatedItems: any[] = []; 
  activeTab: string = 'product';

  //FACEBOOK
  facebookShareMsg: string = ''
  shareURL:string=''
  showZipAlert:boolean = false;

  private ipinfoToken: string = '38d3cd684c4117';
  constructor(private http: HttpClient, private renderer: Renderer2, private el: ElementRef) {
    this.zipCode = '';
   
  }
  
  ngOnInit(): void {
    this.getCurLoc()
   }
  // Function to handle zip code input changes
  onZipCodeChange() {
    if(this.other && !this.zipCode.trim()) {
      // Show an alert message
      this.showZipAlert = true;
    } else {
      // Hide the alert message
      this.showZipAlert = false;
    }

    if (this.zipCode.length > 2) {
        this.http.get(`http://localhost:3000/api/autocomplete-zip?zipCode=${this.zipCode}`)
            .subscribe((data: any) => {
                this.suggestions = data.suggestions;
            });
    } else {
        this.suggestions = [];
    }
  }

  // function to display Zip code changes
  selectSuggestion(suggestion: string) {
      this.zipCode = suggestion;
      this.suggestions = [];
  }

  //Current Location
  getCurLoc() {
    const apiUrl = `https://ipinfo.io/json?token=${this.ipinfoToken}`;
    this.http.get(apiUrl).subscribe((data:any) => {
      this.currLoc=data?.postal
      console.log(data);  
    });
  }
  clearForm(): void {
    this.keyword = '';
    this.category = 'AllCategory'; 
    this.new = '';
    this.used = '';
    this.unspecified = '';
    this.localPickup = '';
    this.freeShipping = '';
    this.distance = ''; 
    this.currentLocation = ''; 
    this.other = '';
    this.zipCode = ''; 
  }


  onSearchForm() {
    

    // if (!this.keyword.trim()) {
    //   // Handle the case when the keyword is empty
    //   alert('Please enter a keyword.');
    //   return;
    // }
    const params = new HttpParams({
      fromObject: {
          keyword: this.keyword || '',
          category: this.category || '',
          new: this.new ? 'true' : 'false',
          used: this.used ? 'true' : 'false',
          unspecified: this.unspecified ? 'true' : 'false',
          localPickup: this.localPickup ? 'true' : 'false',
          freeShipping: this.freeShipping ? 'true' : 'false',
          distance: this.distance || '',
          zipCode: this.other ? this.zipCode : this.currLoc || ''
      }
  });
  console.log(params);
  this.http.get('http://localhost:3000/api/eBayFormData', {params}).subscribe((data: any) => {
      //this.displayDataInTable(data);
      this.items = data;
      this.onItemsReceived(data);

      console.log(data);

      console.log("HELLLOOOO");
    //   for(i in data) {
    //     console.log("hi")  
    //  }
      //this.shippingInfo = this.processShippingData(data);
  });
  }

  processShippingData(items: any[], itemId: string): any[] {
    const selectedItem = items.find(item => item.itemId[0] === itemId[0]);
    if (!selectedItem) {
        console.log('Item not found');
        return [];
    }
    
    const shippingInfo = selectedItem.shippingInfo[0] || {};
    
    const processedShippingInfo = {
        cost: shippingInfo?.shippingServiceCost && shippingInfo.shippingServiceCost[0].__value__,
        locations: shippingInfo.shipToLocations,
        handlingTime: shippingInfo.handlingTime,
        expedited: shippingInfo.expeditedShipping,
        oneDay: shippingInfo.oneDayShippingAvailable,
        returns: selectedItem.returnsAccepted
    };

    console.log(processedShippingInfo);
    return [processedShippingInfo]; // Returns an array containing the shipping info for the specific item
}

processSellerData(items: any[], itemId: string): any[] {
  const selectedItem = items.find(item => item.itemId[0] === itemId[0]);
  if (!selectedItem) {
      console.log('Item not found');
      return [];
  }
  console.log("selectedItem",selectedItem);
  const sellerInfo = selectedItem.sellerInfo[0] || {};
  const storefront = selectedItem.storeInfo[0] || {};
  console.log("sellerInfo----",sellerInfo)
  console.log("storefron-----t",storefront)
  const sellerData = {
    feedbackScore: sellerInfo.feedbackScore,
    popularity: sellerInfo.positiveFeedbackPercent,
    feedbackRatingStar: sellerInfo.feedbackRatingStar,
    topRated: sellerInfo.topRatedSeller ,  
    storeName: storefront.storeName,
    storeURL: storefront.storeURL
  };

  console.log(sellerData);
  return [sellerData]; // Returns an array containing the shipping info for the specific item
}

processSimilarProduct(itemId: string): any[] {

  this.http.get(`http://localhost:3000/api/similarProductsData?itemId=${itemId}`).subscribe((data: any) => {
        console.log("DATA", data);
        this.similarProds = data; 
    }, (error: any) => console.error('Error fetching product details', error));

  return []
  
}
processProductImages(items: any[],itemId: string): any[] {

  const selectedItem = items.find(item => item.itemId[0] === itemId[0]);
  if (!selectedItem) {
      console.log('Item not found');
      return [];
  }
  this.http.get(`http://localhost:3000/api/productImages?prodTitle=${selectedItem.title[0]}`).subscribe((data: any) => {
        console.log("DATAYOYO", data);
        this.prodImages =data.items;
        console.log("hi-",this.prodImages)
    }, (error: any) => console.error('Error fetching product details', error));

  return []
  
}
shareMessage(items: any[],itemId: string) { 
  const selectedItem = items.find(item => item.itemId[0] === itemId[0]);
  const productName = selectedItem.title[0] ?? ''; 
  const price = selectedItem?.price; 
  const link = selectedItem.viewItemURL; 
  const description = `Buy ${productName} at $${price} from the ${link} below.`; 
  console.log("Description === ",description)
  return description; 
}

  shareOnFacebook(items: any[],itemId: string){ 
    const selectedItem = items.find(item => item.itemId[0] === itemId[0]);
    if (selectedItem) { 
      console.log(selectedItem) 
      const link = selectedItem.viewItemURL; 
      this.shareURL = `https://www.facebook.com/sharer/sharer.php?u=${link}"e=${this.facebookShareMsg}` 
      //window.open(this.shareURL, '_blank'); 
      
    } else { 
      console.error('No product selected'); 
    } 
    
  } 


  onItemsReceived(allItems: any[]) {
    this.allItems = allItems; // Store all items
    this.totalItems = allItems.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updatePaginatedItems(); // Paginate the first page
  }

  // Update the items for the current page
  updatePaginatedItems() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedItems = this.allItems.slice(startIndex, startIndex + this.itemsPerPage);
  }

  selectPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return; // Out of range
    }
    this.currentPage = page;
    this.updatePaginatedItems(); // Update the paginated items for the new page
  }

  //Single Item details --->>>
  onProductClick(itemId: string) {
    console.log("Inside....");
    this.showProductDetails = true;
    this.selectedProductitemId = itemId;

    this.http.get(`http://localhost:3000/api/singleItemDetail?itemId=${itemId}`).subscribe((data: any) => {
        // Process and log the shipping data for the clicked product
       
        this.prodInfo = data;
      console.log("ProductInfro",this.prodInfo)
        this.processProductImages(this.items, itemId);

        this.shippingInfo1 = this.processShippingData(this.items, itemId);
        
        this.sellerInfo = this.processSellerData(this.items, itemId);

        this.similarProds = this.processSimilarProduct(itemId);

        this.facebookShareMsg = this.shareMessage(this.items, itemId);

        this.shareOnFacebook(this.items, itemId);
        console.log("URL == ",this.shareURL);
        
    }, (error: any) => console.error('Error fetching product details', error));
}
    openModal() {
      this.showImageModal = true;
    }

    selectTab(tab: string): void {
      this.activeTab = tab;
      // Depending on the tab selected, you might want to call different methods
      // For instance, if you click the 'seller' tab, you might want to load the seller information
      if (tab === 'seller') {
        //this.loadSellerData(); // You'll need to implement this method
      }
      // Implement similar conditions and methods for other tabs if needed
    }

    showMore() {
      if(this.displayCount + 5 >= this.similarProds.length) {
        this.displayCount = this.similarProds.length;
        this.showAll = true;
      } else {
        this.displayCount += 15;
        this.showAll = true;

      }
    }
    
    // Method to reset displayed products to the initial count
    showLess() {
      this.displayCount = 5;
      this.showAll = false;
    }

    addToWishlist(product: any) {
  const wishlistEndpoint = 'http://localhost:3000/api/wishlist'; // Your Node.js server endpoint

  this.http.post(wishlistEndpoint, product).subscribe(
	(response: any) => {
  	console.log('Product added to wishlist:', response);
  	// Implement any feedback logic, like showing a success message to the user
	},
	(error:any) => {
  	console.error('Error adding product to wishlist:', error);
  	// Implement any error handling logic here
	}
  );
}

removeFromWishlist(item: any) {
  console.log(item);
  const wishlistEndpoint = `http://localhost:3000/wishlist/${item.itemId}`; // The Node.js server endpoint for deletion

  this.http.delete(wishlistEndpoint).subscribe(
	() => {
  	console.log('Product removed from wishlist');
  	// Reset the flag to indicate the product is removed from wishlist
  	item.addedToWishlist = false;
	},
	(error:any) => {
  	console.error('Error removing product from wishlist:', error);
	}
  );
}


    
}


