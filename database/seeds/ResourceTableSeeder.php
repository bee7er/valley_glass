<?php
use App\Template;
use Illuminate\Database\Seeder;
use App\Resource;

class ResourceTableSeeder extends Seeder {

    public function run()
    {
        DB::table('resources')->delete();

        $defaultTemplate = Template::where('name', 'Default template')->firstOrFail();
        $gifTemplate = Template::where('name', 'GIF template')->firstOrFail();
        $imageTemplate = Template::where('name', 'Image template')->firstOrFail();
        $videoTemplate = Template::where('name', 'Video template')->firstOrFail();

        $resource = new Resource();
        $resource->name = 'Chips & Waffles';
        $resource->image = '';
        $resource->thumb = 'chipwaffle_still.png';
        $resource->url = 'https://player.vimeo.com/video/145770435';
        $resource->type = 'video';
        $resource->template_id = $videoTemplate->id;
        $resource->description = 'How chips and waffles come from a potato.<br /> <a href="https://vimeo.com/145770435">Chips &amp; Waffles</a> from <a
href="https://vimeo.com/russether">Russell Etheridge</a> on <a href="https://vimeo.com">Vimeo</a>.';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();

        $resource = new Resource();
        $resource->name = 'Bathroom Boarder';
        $resource->image = '';
        $resource->thumb = 'bathroomboarder_th.png';
        $resource->url = 'https://player.vimeo.com/video/137499366';
        $resource->type = 'video';
        $resource->template_id = $videoTemplate->id;
        $resource->description = 'A little arachnid themed short I managed to squeeze out during spare time.';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();

        $resource = new Resource();
        $resource->name = 'Propz - Binoculars';
        $resource->image = '';
        $resource->thumb = 'binoculars.jpg';
        $resource->url = 'https://player.vimeo.com/video/122770363';
        $resource->type = 'video';
        $resource->template_id = $videoTemplate->id;
        $resource->description = 'My feline-vision-aid contribution to the Propz series.';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();

        $resource = new Resource();
        $resource->name = 'Blizzard Walk';
        $resource->image = 'blizzard_loop.gif';
        $resource->thumb = 'blizzard.jpg';
        $resource->type = 'gif';
        $resource->template_id = $gifTemplate->id;
        $resource->url = 'blizzard_loop.gif';
        $resource->description = 'A little animation test.';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();

        $resource = new Resource();
        $resource->name = 'Weetabix - On the Go';
        $resource->image = '';
        $resource->thumb = 'catchaleavingtrain.jpg';
        $resource->url = '';
        $resource->type = 'video';
        $resource->template_id = $videoTemplate->id;
        $resource->description = 'A series of quick morning cheats I designed and directed for Weetabix.';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();

        $resource = new Resource();
        $resource->name = 'Propz - Shoelaces';
        $resource->image = '';
        $resource->thumb = 'shoelaces.jpg';
        $resource->url = 'https://player.vimeo.com/video/119444475';
        $resource->type = 'video';
        $resource->template_id = $videoTemplate->id;
        $resource->description = 'My valentines-shoe contribution to the Propz series.';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();

        $resource = new Resource();
        $resource->name = 'Showreel 2014';
        $resource->image = '';
        $resource->thumb = 'showreel2014.png';
        $resource->url = 'https://player.vimeo.com/video/104406081';
        $resource->type = 'video';
        $resource->template_id = $videoTemplate->id;
        $resource->description = 'My feline-vision-aid contribution to the Propz series.';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();

        $resource = new Resource();
        $resource->name = 'The Lion';
        $resource->image = '';
        $resource->thumb = 'thelion.jpg';
        $resource->url = 'https://player.vimeo.com/video/60453523';
        $resource->type = 'video';
        $resource->template_id = $videoTemplate->id;
        $resource->description = 'Award winning animated music video for US based band Escapist Papers.';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();

        $resource = new Resource();
        $resource->name = 'Robbie Williams – Take the Crown';
        $resource->image = '';
        $resource->thumb = 'robbiew.jpg';
        $resource->url = 'http://player.vimeo.com/video/69224915';
        $resource->type = 'video';
        $resource->template_id = $videoTemplate->id;
        $resource->description = 'Promo for Robbie Williams’ ‘Take the Crown’ album release.';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();

        $resource = new Resource();
        $resource->name = 'Blackberry – Those Who Do';
        $resource->image = '9ca298e803a2960f11d20681ed96216d3d2c4c21.jpg';
        $resource->thumb = 'blackberry.jpg';
        $resource->url = 'blackberry.jpg';
        $resource->type = 'image';
        $resource->template_id = $imageTemplate->id;
        $resource->description = 'Computer game style footballer…';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();

        $resource = new Resource();
        $resource->name = 'Merry Xmas!';
        $resource->image = '30936a68dc1ea567f08dea544a89c2cdd7927a13.jpg';
        $resource->thumb = 'xmas_still_life.jpg';
        $resource->url = 'xmas_still_life.jpg';
        $resource->type = 'image';
        $resource->template_id = $imageTemplate->id;
        $resource->description = 'An animated Xmas card, created with Cinema 4D and After Effects.';
        $resource->content_a = 'Hello from content A';
        $resource->content_b = 'Hello from content B';
        $resource->save();
    }

}
