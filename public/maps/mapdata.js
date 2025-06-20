var simplemaps_countrymap_mapdata={
  main_settings: {
   //General settings
    width: "responsive", //'700' or 'responsive'
    background_color: "#FFFFFF",
    background_transparent: "yes",
    border_color: "#ffffff",
    
    //State defaults
    state_description: "State description",
    state_color: "#88A4BC",
    state_hover_color: "#3B729F",
    state_url: "",
    border_size: 1.5,
    all_states_inactive: "no",
    all_states_zoomable: "yes",
    
    //Location defaults
    location_description: "Location description",
    location_url: "",
    location_color: "#FF0067",
    location_opacity: 0.8,
    location_hover_opacity: 1,
    location_size: 25,
    location_type: "square",
    location_image_source: "frog.png",
    location_border_color: "#FFFFFF",
    location_border: 2,
    location_hover_border: 2.5,
    all_locations_inactive: "no",
    all_locations_hidden: "no",
    
    //Label defaults
    label_color: "#ffffff",
    label_hover_color: "#ffffff",
    label_size: 16,
    label_font: "Arial",
    label_display: "auto",
    label_scale: "yes",
    hide_labels: "no",
    hide_eastern_labels: "no",
   
    //Zoom settings
    zoom: "yes",
    manual_zoom: "yes",
    back_image: "no",
    initial_back: "no",
    initial_zoom: "-1",
    initial_zoom_solo: "no",
    region_opacity: 1,
    region_hover_opacity: 0.6,
    zoom_out_incrementally: "yes",
    zoom_percentage: 0.99,
    zoom_time: 0.5,
    
    //Popup settings
    popup_color: "white",
    popup_opacity: 0.9,
    popup_shadow: 1,
    popup_corners: 5,
    popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
    popup_nocss: "no",
    
    //Advanced settings
    div: "map",
    auto_load: "yes",
    url_new_tab: "no",
    images_directory: "default",
    fade_time: 0.1,
    link_text: "View Website",
    popups: "detect",
    state_image_url: "",
    state_image_position: "",
    location_image_url: ""
  },
  state_specific: {
    UYAR: {
      name: "Artigas",
      color: "#b4a9d3",
      description: "Litoral Norte"
    },
    UYCA: {
      name: "Canelones",
      color: "#e66065",
      description: "Metropolitana"
    },
    UYCL: {
      name: "Cerro Largo",
      color: "#f7f6f7",
      description: "Sin bodegas turisticas"
    },
    UYCO: {
      name: "Colonia",
      color: "#a44d78",
      description: "Litoral Sur"
    },
    UYDU: {
      name: "Durazno",
      color: "#f7f6f7",
      description: "Sin bodegas turisticas"
    },
    UYFD: {
      name: "Florida",
      color: "#f7f6f7",
      description: "Sin bodegas turisticas"
    },
    UYFS: {
      name: "Flores",
      color: "#f7f6f7",
      description: "Sin bodegas turisticas"
    },
    UYLA: {
      name: "Lavalleja",
      color: "#f7f6f7",
      description: "Sin bodegas turisticas"
    },
    UYMA: {
      name: "Maldonado",
      color: "#58a8db",
      description: "Oceánica"
    },
    UYMO: {
      name: "Montevideo",
      color: "#e66065",
      description: "Metropolitana"
    },
    UYPA: {
      name: "Paysandú",
      color: "#b4a9d3",
      description: "Litoral Norte"
    },
    UYRN: {
      name: "Río Negro",
      color: "#f7f6f7",
      description: "Sin bodegas turisticas"
    },
    UYRO: {
      name: "Rocha",
      color: "#58a8db",
      description: "Oceánica"
    },
    UYRV: {
      name: "Rivera",
      color: "#f0c22f",
      description: "Norte"
    },
    UYSA: {
      name: "Salto",
      color: "#b4a9d3",
      description: "Litoral Norte"
    },
    UYSJ: {
      name: "San José",
      color: "#e66065",
      description: "Metropolitana"
    },
    UYSO: {
      name: "Soriano",
      color: "#f7f6f7",
      description: "Sin bodegas turisticas"
    },
    UYTA: {
      name: "Tacuarembó",
      color: "#f7f6f7",
      description: "Sin bodegas turisticas"
    },
    UYTT: {
      name: "Treinta y Tres",
      color: "#f7f6f7",
      description: "Sin bodegas turisticas"
    }
  },
  locations: {},
  labels: {
    UYAR: {
      name: "Artigas",
      parent_id: "UYAR"
    },
    UYCA: {
      name: "Canelones",
      parent_id: "UYCA"
    },
    UYCL: {
      name: "Cerro Largo",
      parent_id: "UYCL"
    },
    UYCO: {
      name: "Colonia",
      parent_id: "UYCO"
    },
    UYDU: {
      name: "Durazno",
      parent_id: "UYDU"
    },
    UYFD: {
      name: "Florida",
      parent_id: "UYFD"
    },
    UYFS: {
      name: "Flores",
      parent_id: "UYFS"
    },
    UYLA: {
      name: "Lavalleja",
      parent_id: "UYLA"
    },
    UYMA: {
      name: "Maldonado",
      parent_id: "UYMA"
    },
    UYMO: {
      name: "Montevideo",
      parent_id: "UYMO"
    },
    UYPA: {
      name: "Paysandú",
      parent_id: "UYPA"
    },
    UYRN: {
      name: "Río Negro",
      parent_id: "UYRN"
    },
    UYRO: {
      name: "Rocha",
      parent_id: "UYRO"
    },
    UYRV: {
      name: "Rivera",
      parent_id: "UYRV"
    },
    UYSA: {
      name: "Salto",
      parent_id: "UYSA"
    },
    UYSJ: {
      name: "San José",
      parent_id: "UYSJ"
    },
    UYSO: {
      name: "Soriano",
      parent_id: "UYSO"
    },
    UYTA: {
      name: "Tacuarembó",
      parent_id: "UYTA"
    },
    UYTT: {
      name: "Treinta y Tres",
      parent_id: "UYTT"
    }
  },
  legend: {
    entries: []
  },
  regions: {}
};