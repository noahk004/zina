import {
  RemoteUser 
} from "agora-rtc-react";

export default function RemoteUserComponent({ user }) {


  return (
    <div className="rounded-lg overflow-hidden bg-white w-[200px] h-fit">
      <div className="rounded-lg overflow-hidden h-[120px]">
        <RemoteUser user={user} />
      </div>
      <div className="flex px-3 justify-between items-center py-[3px]">
        <p className="text-sm">{user.uid}</p>

      </div>
    </div>
  );
}
