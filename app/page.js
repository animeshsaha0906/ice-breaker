import Link from "next/link";
import './landingPage.css'






export default function Home() {
  return (



    
    <main>
      
      <div className="iceBreakers-Logo">
        <div className="iceBreakers-Box">
          <h1 className="iceBreakers-text">Ice-Breakers</h1>
        </div>
      </div>



      <div className="landingPageButtons">
        <div className="makeRoom">
          <div className="makeRoom-Color"></div>
          <form>
            <label for="makeRoomInput" className="makeRoom-Label">Make a Room</label>
            <input type="text" id="makeRoomInput" name="makeRoomInput" defaultValue="Room Name" className="makeRoom-Textbox"></input>
            <input type="submit" className="makeRoom-Button" value="Enter"></input>
          </form>
        </div>

        <div className="joinRoom">
          <div className="joinRoom-Color"></div>
          <form>
            <label for="joinRoomInput" className="joinRoom-Label">Join a Room</label>
            <input type="text" id="joinRoomInput" name="joinRoomInput" defaultValue="Room Code" className="joinRoom-Textbox"></input>
            <input type="submit" className="joinRoom-Button" value="Enter"></input>
          </form>

        </div>
      </div>

    </main>

  );
}
