<?php namespace App\Http\Controllers\Admin;

use App\Http\Controllers\AdminController;
use App\Http\Helpers\TemplateHelper;
use App\Template;
use App\Http\Requests\Admin\TemplateRequest;
use App\Http\Requests\Admin\DeleteRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Helpers\Thumbnail;
use Datatables;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TemplateController extends AdminController
{
    /**
     * TemplateController constructor.
     */
    public function __construct()
    {
        view()->share('type', 'template');
    }

    /**
     * Show a list of all the template posts.
     *
     * @return View
     */
    public function index()
    {
        $templates = $this->getTemplates();
        // Show the page
        return view('admin.template.index', compact('templates'));
    }

    /**
     * Show the form for creating a new template.
     *
     * @return Response
     */
    public function create()
    {
        $environmentVars = TemplateHelper::$environment_vars;
        $resourceAttrs = TemplateHelper::$resource_attrs;
        // Show the page
        return view('admin.template.create_edit', compact('environmentVars', 'resourceAttrs'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(TemplateRequest $request)
    {
        Log::info('Saving new data', [$request->get('container')]);

        //@todo put this in a function as is used twice
        $name = $request->get('name');
        $container = json_decode($request->get('container'));
        if ($container === null) {
            $container = $request->get('container');
        }

        $template = new Template([
            'name' => $name,
            'container' => html_entity_decode($container)
        ]);
        $template->save();
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int $id
     * @return Response
     */
    public function edit(Template $template)
    {
        $environmentVars = TemplateHelper::$environment_vars;
        $resourceAttrs = TemplateHelper::$resource_attrs;
        // Show the page
        return view('admin.template.create_edit', compact('template', 'environmentVars', 'resourceAttrs'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int $id
     * @return Response
     */
    public function update(TemplateRequest $request, Template $template)
    {
        try {
            Log::info('1', []);
            $name = $request->get('name');
            $container = json_decode($request->get('container'));
            if ($container === null) {
                $container = $request->get('container');
            }
            $container = removeWhiteSpace($container);

            $template->update([
                'name' => $name,
                'container' => html_entity_decode($container)
            ]);
        } catch (\Exception $e) {
            Log::info('Error updating data: ' . $template->id, [
                $e->getMessage(),
                $e->getFile(),
                $e->getLine()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return Response
     */

    public function delete(Template $template)
    {
        return view('admin.template.delete', compact('template'));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return Response
     */
    public function destroy(Template $template)
    {
        $template->delete();
    }

    /**
     * Get all templates
     *
     * @return array
     */
    public function getTemplates()
    {
        return Template::orderBy('name')
            ->get()
            ->map(function ($template) {
                return [
                    'id' => $template->id,
                    'type' => $template->name,
                    'created_at' => $template->created_at->format('d/m/Y'),
                ];
            });
    }

    /**
     * Show a list of all the templates formatted for Datatables.
     *
     * @return Datatables JSON
     */
    public function data()
    {
        $templates = $this->getTemplates();

        return Datatables::of($templates)
            ->add_column('actions', '<a href="{{{ url(\'admin/template/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm iframe" ><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
                <a href="{{{ url(\'admin/template/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger iframe"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
                <input type="hidden" name="row" value="{{$id}}" id="row">')
            ->remove_column('id')
            ->make();
    }
}
