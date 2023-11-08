import { Component,Input,OnInit,ViewChild } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { debounceTime, map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { EbayItem } from './types';
import { Renderer2, ElementRef } from '@angular/core';
import { Modal } from 'bootstrap';

declare var $:any
@Component({
  selector: 'app-ass3search-form',
  templateUrl: './ass3search-form.component.html',
  styleUrls: ['./ass3search-form.component.css'],

})


export class Ass3searchFormComponent{
  @ViewChild('myModal', { static: false }) private myModal!: ElementRef;
  isprodselected:boolean = false;
  keyword: string = '';
  category: string = 'AllCategory';
  new: string = '';
  used: string = '';
  unspecified: string = '';
  localPickup: string = '';
  freeShipping: string = '';
  distance: string = '10';
  currentLocation: string = 'currentLocation';
  other: any = false;
  zipCode: string = '';
  currLoc:string='';
  suggestions: string[] = [];
  items: any[] = [];
  showProductDetails: boolean = false;
  selectedProd:any={}
  productData: any;
  showImageModal: boolean = false;
  prodInfo:any[] = [];
  shippingInfo: any[] = [];
  shippingInfo1:any[] = [];
  sellerInfo:any[] = [];
  prodImages:any[] = [];
  wishlistItems: any[] = [];
  wishlist: any[] = [];
  isBtn:boolean=true;
  wishlistLoaded: boolean = false; // to track if the wishlist is loaded

  similarProds:any[] = [];
  displayCount = 5; 
  showAll = false; 
  search=false;
  // currentPage: number = 1;
  // itemsPerPage: number = 10;
   totalItems: number =0;
   totalPages: number =0;
   pages: number[] = [];
   selectedProductitemId: string = '';
  buttonC:any='results';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  allItems: any[] = []; // This will hold all fetched items
  paginatedItems: any[] = []; 
  activeTab: string = 'product';
  isZipCodeValid : boolean = true;
  //FACEBOOK
  facebookShareMsg: string = ''
  shareURL:string=''
  showZipAlert:boolean = false;
  isKeyVal:boolean= true;
  noRecord:boolean=false;
  sortDirection: string = 'ascending'; 
  sortOrder: string='default';
  isloading:Boolean = false;
  isKeyValid:any =false;
  private ipinfoToken: string = '38d3cd684c4117';
  errorMessage: string=''
  isZipCodeInvalid!: boolean;
  errorMessage1: string=''
  constructor(private http: HttpClient, private renderer: Renderer2, private el: ElementRef) {
    this.zipCode = '';
   
  }

  handleZipCodeChange(value: any) {
    this.check_zipcode();
    console.log('hello neha1')
    if (value && value?.postalCode) {
      this.zipCode = value.postalCode;}
     else {
      this.zipCode = value;
    }
  }
  check_zipcode() {
    console.log('hello')
    console.log(this.zipCode)
   
    this.isZipCodeInvalid = this.other && this.zipCode.length==0;
    console.log(this.other,this.isZipCodeInvalid)
    if (this.isZipCodeInvalid ){
          console.log("here inside" )
            this.errorMessage1 = 'Please enter a zip code.';
        } else {
            console.log('errorgone')
            this.errorMessage1 = '';
        }
  }
  find(s:any):void {
    console.log(s.value)
    this.isKeyValid = s.touched && !s.value.trim()
    if(this.isKeyValid)
    {
      this.errorMessage='Please enter a keyword';
    }
    else{
      this.errorMessage=''
    }
  
    // this.updateBtm();
  }
  // ZipVal(){
    
  //   this.ZipVal = /^[0-9]{5}$/.test(this.zipCode);
  
  //     this.isZipCodeValid = true;

  

  //   this.updateBtm();
  // }
  // updateBtm(){
  //   const isKeywordInvalidOrEmpty = this.isKeyVal;
  //   const isZipCodeSelected=(this.other && !this.showZipAlert) 
  //   console.log(isKeywordInvalidOrEmpty,isZipCodeSelected)
  //   if (this.other){
  //     this.isBtn = isKeywordInvalidOrEmpty && isZipCodeSelected
  //   }
  //   else{
  //   this.isBtn = isKeywordInvalidOrEmpty
  //   }

  // }

  
  openModal() {  
    
    const modal = new Modal(this.myModal?.nativeElement);
    modal.show();
    // this.carousal=true;
  }
  ngOnInit(): void {
    this.getCurLoc()
   }
  // Function to handle zip code input changes
  onZipCodeChange() :void{
    console.log(this.zipCode)
    this.other=true
    
    // if(this.other && !this.zipCode.trim()) {
    //   // Show an alert message
    //   this.showZipAlert = true;
    // } else {
    //   // Hide the alert message
    //   this.showZipAlert = false;
    // }
    // // this.updateBtm()
    if (this.zipCode.trim().length > 2) {
        this.http.get(`/api/autocomplete-zip?zipCode=${this.zipCode}`)
            .subscribe((data: any) => {
                this.suggestions = data.suggestions;
            });
    } else {
        this.suggestions = [];
    }
  }

  // function to display Zip code changes
  selectSuggestion(suggestion: string) {
    this.other=true
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
    this.search=false;
    this.other = false;
    this.zipCode = ''; 
    this.showProductDetails = false;
    this.items=[];
    this.totalItems=0;
    this.paginatedItems=[];
    this.wishlistItems=[];
    this.currentLocation = 'currentLocation';

  }

  loadWishlist() {
    this.getWishlist();
    this.wishlistLoaded = true; // set to true to show the table
  }

onWishListClick(){
  this.buttonC='wish';
  this.showProductDetails=false;
this.getWishlist()

}
onPageChange(page: number) {
  this.currentPage = page;
}
  onSearchForm() {
    console.log("Category",this.category);
    type CategoryKey = keyof typeof categoryMap; 

    const categoryMap = {
      'Art': '550',
      'Baby': '2984',
      'Books':'267',
      'Clothing, Shoes & Accessories':'11450',
      'Computers/Tablets & Networking':'58058',
      'Health & Beauty' : '26395',
      'Music':'26395',
      'Video Games & Consoles':'1249'
      
  };

  const category: CategoryKey = this.category as CategoryKey; // Ensure that `this.category` is of type CategoryKey
    
this.showProductDetails=false
    const params = new HttpParams({
      fromObject: {
          keyword: this.keyword || '',
          category: categoryMap[category],
          new: this.new ? 'true' : 'false',
          used: this.used ? 'true' : 'false',
          unspecified: this.unspecified ? 'true' : 'false',
          localPickup: this.localPickup ? 'true' : 'false',
          freeShipping: this.freeShipping ? 'true' : 'false',
          distance: this.distance || '',
          zipCode: this.other ? this.zipCode.trim() : this.currLoc || ''
      }
  });
  // if(this.showProductDetails.length < 0 ){
  //   this.noRecord = true
  // }
  this.isloading = true;
  this.search=true

  console.log(params);
  this.http.get('/api/eBayFormData', {params}).subscribe((data: any) => {
      //this.displayDataInTable(data);
      this.items = data;
      this.onItemsReceived(data);
this.currentPage=1
      console.log(data);

      console.log("HELLLOOOO");
      this.isloading = false;

    
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
    feedbackScore: parseInt(sellerInfo.feedbackScore),
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
  this.isloading = true;

  this.http.get(`/api/similarProductsData?itemId=${itemId}`).subscribe((data: any) => {
        console.log("Similar Product DATA", data);
        this.similarProds = data; 
        this.isloading = false;
    }, (error: any) => console.error('Error fetching product details', error));

  return []
  
}
processProductImages(items: any[],itemId: string): any[] {
  this.isloading = true;
  const selectedItem = items.find(item => item.itemId[0] === itemId[0]);
  if (!selectedItem) {
      console.log('Item not found');
      return [];
  }
  this.http.get(`/api/productImages?prodTitle=${selectedItem.title[0]}`).subscribe((data: any) => {
        console.log("DATAYOYO", data);
        this.prodImages =data.items;
        console.log("hi-",this.prodImages)
        this.isloading = false;
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
    
    const wishlistItemIds = new Set(this.wishlistItems.map(item => item.itemId));

    // Iterate over allItems and update the `addedToWishlist` property
    this.allItems = this.allItems.map(product => {
      // Check if the product's itemId is in the wishlistItemIds set
      const isProductInWishlist = wishlistItemIds.has(product.itemId);
      return {
        ...product,
        addedToWishlist: isProductInWishlist
      };
    });
    
    this.paginatedItems = this.allItems.slice(startIndex, startIndex + this.itemsPerPage);
  }
    

  selectPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return; // Out of range
    }
    this.currentPage = page;
    this.updatePaginatedItems(); // Update the paginated items for the new page
  }

onListClick(): void {
  this.showProductDetails = false; // Hide product details
  this.buttonC = 'results'; // Set to results to show the result table
  
  // If you're using pagination and you want to show the first page of results
  this.currentPage = 1;
  this.updatePaginatedItems();
}
getTotal(): number {
  return this.wishlistItems.reduce((acc, item) => acc + parseFloat(item.price), 0);
}

onProductClick(item: any) {
  this.isloading = true;
  console.log("Inside....");
  this.showProductDetails = true;
  this.activeTab='product'
  this.selectedProductitemId = item.itemId;
  this.selectedProd=item
  console.log("help",this.selectedProd)
  this.http.get(`/api/singleItemDetail?itemId=${this.selectedProductitemId}`).subscribe((data: any) => {
      // Process and log the shipping data for the clicked product
     
      this.prodInfo = data;
      this.isloading = false;
    console.log("ProductInfro",this.prodInfo)
      this.processProductImages(this.items, this.selectedProductitemId);

      this.shippingInfo1 = this.processShippingData(this.items, this.selectedProductitemId);
      
      this.sellerInfo = this.processSellerData(this.items, this.selectedProductitemId);

      this.similarProds = this.processSimilarProduct(this.selectedProductitemId);
      console.log("SIMILARPROD---",this.similarProds)
      this.facebookShareMsg = this.shareMessage(this.items, this.selectedProductitemId);

      this.shareOnFacebook(this.items, this.selectedProductitemId);
      console.log("URL == ",this.shareURL);
      
  }, (error: any) => console.error('Error fetching product details', error));
}

    

    selectTab(tab: string): void {
      this.activeTab = tab;
      // Depending on the tab selected, you might want to call different methods
      // For instance, if you click the 'seller' tab, you might want to load the seller information
      if (tab === 'seller') {
        //this.loadSellerData(); // You'll need to implement this method
      }
      if (tab === 'photos') {
        this.showImageModal=true
        //this.processProductImages(this.selectedProd) 
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
      this.isloading = true;
  const wishlistEndpoint = '/api/wishlist'; // Your Node.js server endpoint

  this.http.post(wishlistEndpoint, product).subscribe(
	(response: any) => {
    this.isloading = false;
    console.log('Product added to wishlist:', response);
    //product.inWishlist = true;
    product.addedToWishlist = true;
  	// Implement any feedback logic, like showing a success message to the user
	},
	(error:any) => {
  	console.error('Error adding product to wishlist:', error);
  	// Implement any error handling logic here
	}
  );
}

removeFromWishlist(item: any) {
  this.isloading = true;
  console.log(item);
  const wishlistEndpoint = `/api/wishlist/${item.itemId}`; // The Node.js server endpoint for deletion

  this.http.delete(wishlistEndpoint).subscribe(
	() => {
    this.isloading = false;
  	console.log('Product removed from wishlist');
    // Reset the flag to indicate the product is removed from wishlist
    // if(item.has('add'))
    item.addedToWishlist = false;
    this.getWishlist()
    //item.inWishlist = false;
	},
	(error:any) => {
  	console.error('Error removing product from wishlist:', error);
	}
  );
 
}

getWishlist() {
  this.isloading = true;
  const wishlistEndpoint = '/api/wishlist'; // Your Node.js server endpoint

  this.http.get(wishlistEndpoint).subscribe(
	(items: any) => {
    this.isloading = false;
  	this.wishlistItems = this.filterUniqueItems(items);
  	console.log('Unique Wishlist items:', this.wishlistItems);
	},
	(error:any) => {
  	console.error('Error retrieving wishlist items:', error);
	}
  );
}

filterUniqueItems(items: any[]): any[] {
  const uniqueItems = [];
  const itemIds = new Set();

  for (const item of items) {
    console.log(item)
	const itemId = item.itemId; // Assuming itemId is an array with a single string value
	if (!itemIds.has(itemId)) {
  	itemIds.add(itemId);
  	uniqueItems.push(item);
	}
  }

  return uniqueItems;
}

sortProducts() {
  const isAscending = this.sortDirection === 'ascending';

  if (this.sortOrder === 'product_name') {
    this.similarProds.sort((a: { prodName: string }, b: { prodName: string }) => {
      return isAscending ? a.prodName.localeCompare(b.prodName) : b.prodName.localeCompare(a.prodName);
    });
  } else if (this.sortOrder === 'days_left') {
    this.similarProds.sort((a:{daysLeft: string}, b: {daysLeft: string}) => {
      const daysLeftA = parseInt(a.daysLeft);
      const daysLeftB = parseInt(b.daysLeft);
      return isAscending ? daysLeftA - daysLeftB : daysLeftB - daysLeftA;
    });
  } else if (this.sortOrder === 'price') {
    this.similarProds.sort((a: { price: string  }, b: { price: string } ) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      return isAscending ? priceA - priceB : priceB - priceA;
    });
  } else if (this.sortOrder === 'shipping_cost') {
    this.similarProds.sort((a: { shippingCost:  string }, b: { shippingCost:  string }) => {
      const shippingCostA = parseFloat(a.shippingCost);
      const shippingCostB = parseFloat(b.shippingCost);
      return isAscending ? shippingCostA - shippingCostB : shippingCostB - shippingCostA;
    });
  }
}

getStarColor(score: number): string {
  if (score >= 0 && score <= 9) {
    return ''; // No color for score 0-9.
  } 
  if (score <= 49) {
    return 'yellow';
  } 
  if (score <= 99) {
    return 'blue';
  } 
  if (score <= 499) {
    return 'turquoise';
  } 
  if (score <= 999) {
    return 'purple';
  } 
  if (score <= 4999) {
    return 'red';
  } 
  if (score <= 9999) {
    return 'green';
  } 
   if (score <= 24999) {
    return 'yellow';
  } 
   if (score <= 49999) {
    return 'turquoise';
  } 
  if (score <= 99999) {
    return 'purple';
  } 
   if (score <= 499000) {
    return 'red';
  } 
   if (score <= 999000) {
    return 'green';
  } 
   {
    return 'silver';
  }
}
processTitle(title1:string): string {
  console.log(title1)

  console.log('hello',title1.length)

  if (title1.length > 35) {
    let shortenedTitle = title1.slice(0, 25);
    const lastSpaceIndex = shortenedTitle.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      shortenedTitle = shortenedTitle.slice(0, lastSpaceIndex);
    }
    return `${shortenedTitle}…`;
  }
  return title1;
}


    
}


