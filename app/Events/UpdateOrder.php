<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UpdateOrder implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $orderList;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($orderList)
    {
        $this->orderList = $orderList;
    }
    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('tableOrder');
    }
    public function broadcastWith() /**add data to the broadcast event */
    {
        //return $this->orderItem;
        return ["orderList" => $this->orderList];
    }
}
