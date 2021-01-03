<?php
use Illuminate\Database\Seeder;
use App\Template;

class TemplateTableSeeder extends Seeder {

    public function run()
    {
        DB::table('templates')->delete();

        $template = new Template();
        $template->name = 'Default template';
        $template->container = '
<div style="width: 100%;padding:0;margin:0;border:0px solid blue;text-align: center;">
    <span style="width: 480px;"><table
                    style="width:480px;padding:5px;margin: 0px auto;">
                <tr style="border:0px solid red;">
                    <td style="border:1px solid #c4c4c4;" colspan="2"><h3 style="margin:0;padding:0;">#NAME#</h3></td>
                </tr>
                <tr style="border:0px solid red;">
                    <td style="border:1px solid #c4c4c4;">#CONTENT_A#</td>
                    <td style="border:1px solid #c4c4c4;">#CONTENT_B#</td>
                </tr>
            </table><img style="border:1px solid #d2d2d2;" src="../img/images/#IMAGE#" width="480" frameborder="0">
    <p style="border:0px solid red;"><p style="border:0px solid red;">#DESCRIPTION#</p>
    <p style="text-align: center;"><a href="/"><img src="../img/back.png" alt="Go back" title="Go back" width="38px"></a></p></span></div>';
        $template->save();

        $template = new Template();
        $template->name = 'GIF template';
        $template->container = '
<div style="width: 100%;padding:0;margin:0;border:0px solid blue;text-align: center;">
    <span style="width: 480px;"><table
                    style="width:480px;padding:5px;margin: 0px auto;">
                <tr style="border:0px solid red;">
                    <td style="border:1px solid #c4c4c4;" colspan="2"><h3 style="margin:0;padding:0;">#NAME#</h3></td>
                </tr>
                <tr style="border:0px solid red;">
                    <td style="border:1px solid #c4c4c4;">#CONTENT_A#</td>
                    <td style="border:1px solid #c4c4c4;">#CONTENT_B#</td>
                </tr>
            </table><img style="border:1px solid #d2d2d2;" src="../appfiles/resource/#IMAGE#" width="480" height="480" frameborder="0">
    <p style="border:0px solid red;">#DESCRIPTION#</p>
    <p style="text-align: center;"><a href="/"><img src="../img/back.png" alt="Go back" title="Go back" width="38px"></a></p></span></div>';
        $template->save();

        $template = new Template();
        $template->name = 'Image template';
        $template->container = '
<div style="width: 100%;padding:0;margin:0;border:0px solid blue;text-align: center;">
    <span style="width: 480px;"><table
                    style="width:480px;padding:5px;margin: 0px auto;">
                <tr style="border:0px solid red;">
                    <td style="border:1px solid #c4c4c4;" colspan="2"><h3 style="margin:0;padding:0;">#NAME#</h3></td>
                </tr>
                <tr style="border:0px solid red;">
                    <td style="border:1px solid #c4c4c4;">#CONTENT_A#</td>
                    <td style="border:1px solid #c4c4c4;">#CONTENT_B#</td>
                </tr>
            </table><img style="border:1px solid #d2d2d2;" src="../appfiles/resource/#IMAGE#" width="480" frameborder="0">
    <p style="border:0px solid red;">#DESCRIPTION#</p>
    <p style="text-align: center;"><a href="/"><img src="../img/back.png" alt="Go back" title="Go back" width="38px"></a></p></span></div>';
        $template->save();

//        <video preload="" src="blob:#URL#"></video>
        $template = new Template();
        $template->name = 'Video template';
        $template->container = '
<div style="width: 100%;padding:0;margin:0;text-align: center;">
    <span style="width: 480px;"><table
                    style="width:480px;padding:5px;margin: 0px auto;">
                <tr style="border:0px solid red;">
                    <td style="border:1px solid #c4c4c4;" colspan="2"><h3 style="margin:0;padding:0;">#NAME#</h3></td>
                </tr>
                <tr style="border:0px solid red;">
                    <td style="border:1px solid #c4c4c4;">#CONTENT_A#</td>
                    <td style="border:1px solid #c4c4c4;">#CONTENT_B#</td>
                </tr>
            </table><iframe style="border:1px solid #d2d2d2;" src="#URL#" width="480" height="480"
    frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
    <p style="border:0px solid red;">#DESCRIPTION#</p>
    <p style="text-align: center;"><a href="#BASE_URL#"><img src="../img/back.png" alt="Go back" title="Go back" width="38px"></a></p></span></div>';
        $template->save();
    }
}
