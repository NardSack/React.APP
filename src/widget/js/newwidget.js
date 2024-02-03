
import SendBird, { ConnectionHandler } from '@sendbird/chat';
import { GroupChannelHandler, GroupChannelModule } from '@sendbird/chat/groupChannel';
import SendBirdDesk from 'sendbird-desk';

import { simplify } from './simplify.js';
import { parseDom } from './domparser.js';
import Broadcast from './broadcast.js';

import Dialog from './component/dialog.js';
import Spinner from './component/spinner.js';
import TicketElement from './component/ticket.js';
import MessageElement from './component/message.js';
import NotificationElement from './component/notification.js';
import { setSb } from './globalStore.js';

export default class NewWidget {

    constructor(){
        this.element = document.getElementById('sb-desk');
        this.element.className = '-sbd-widget';

        NewWidget.panel = this.panel = parseDom(
        `<div class='-sbd-panel'>
        <div class='-sbd-header'>
            <div class='-sbd-title'>Chat</div>
            <div class='-sbd-tabs'>
                <div class='-sbd-tab-bar'></div>
            </div>
            <div class='-sbd-menu'><div class='icon'></div></div>
            <div class='-sbd-menu-list'>
              <div class='-sbd-menu-item' data-cmd='signout'>Sign out</div>
            </div>
        </div>
        <div class='-sbd-channel-list'>
            <div class='-sbd-channel-new'>
                <div class='icon'></div>
                <div class='label'>Start a new conversation.</div>
            </div>
        </div>
        </div>`);

        this.element.appendChild(this.panel);

        let channelNew = simplify(document.querySelector('.-sbd-channel-list > .-sbd-channel-new'));
        channelNew.on("click",()=>{
            
        })


        /// SENDBIRD ACCESS

    }
}