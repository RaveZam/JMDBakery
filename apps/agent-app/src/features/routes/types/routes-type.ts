export type Route = {
  id: string;
  name: string;
};

export type StoreCard = {
  name: string;
  areaTag: string;
  location: string;
  status: string;
  contactName: string;
  contactNumber: string;
  onPress?: () => void;
};

